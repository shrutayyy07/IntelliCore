package com.intellicore.service;

import com.intellicore.model.Document;
import com.intellicore.model.DocumentMetadata;
import com.intellicore.storage.FlatFileStorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class DocumentService {

    private static final Logger logger = LoggerFactory.getLogger(DocumentService.class);

    @Autowired private FlatFileStorageService storage;
    @Autowired private MetadataService metadataService;
    @Autowired private PythonInteropService pythonInterop;
    @Autowired private ConfidenceScoreService confidenceService;
    @Autowired private LogService logService;

    private final ExecutorService batchExecutor = Executors.newFixedThreadPool(8);
    private final AtomicInteger batchProgress = new AtomicInteger(0);
    private volatile int batchTotal = 0;
    private volatile boolean batchRunning = false;

    public Document uploadDocument(MultipartFile file, String uploadedBy) throws IOException {
        String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "unknown";
        String ext = getExtension(originalName);
        String storedName = UUID.randomUUID() + "." + ext;
        Path dest = storage.getUploadPath().resolve(storedName);
        Files.copy(file.getInputStream(), dest);

        Document doc = new Document();
        doc.setFileName(originalName);
        doc.setExt(ext);
        doc.setFileSize(file.getSize());
        doc.setUploadedBy(uploadedBy);
        doc.setStoragePath(dest.toString());

        String mimeType = metadataService.detectMimeType(dest.toFile());
        doc.setFileType(mimeType);

        logService.info("File uploaded: " + originalName + " (" + formatSize(file.getSize()) + ")");
        logService.info("Metadata extracted: type=" + mimeType + ", ext=" + ext);

        processDocument(doc, dest.toFile());
        return storage.saveDocument(doc);
    }

    private void processDocument(Document doc, File file) {
        DocumentMetadata meta;
        boolean blurry = false;

        if (doc.getFileType().contains("pdf")) {
            meta = metadataService.extractPdfMetadata(file);
            doc.setPages(metadataService.getPdfPageCount(file));
        } else if (doc.getFileType().startsWith("image/")) {
            meta = metadataService.extractImageMetadata(file);
            PythonInteropService.BlurResult blurResult = pythonInterop.detectBlur(file);
            blurry = blurResult.blurry();
            doc.setBlurry(blurry);
            logService.visionRequest(doc.getFileName(), blurResult.status());
        } else {
            meta = new DocumentMetadata();
        }

        doc.setMetadata(meta);
        boolean hasMetadata = meta != null && (meta.getTitle() != null || meta.getWidth() > 0);
        double score = confidenceService.computeScore(doc, blurry, hasMetadata);
        doc.setConfidenceScore(score);
        doc.setStatus(confidenceService.determineStatus(score));

        if ("REJECTED".equals(doc.getStatus())) {
            logService.warn("Document flagged (score=" + String.format("%.1f", score) + "): " + doc.getFileName());
        }
    }

    public List<Document> getAllDocuments() {
        return storage.getAllDocuments();
    }

    public Optional<Document> getDocument(String id) {
        return storage.getDocument(id);
    }

    public void deleteDocument(String id) {
        storage.getDocument(id).ifPresent(doc -> {
            if (doc.getStoragePath() != null) {
                try { Files.deleteIfExists(Path.of(doc.getStoragePath())); } catch (IOException ignored) {}
            }
        });
        storage.deleteDocument(id);
        logService.info("Document deleted: " + id);
    }

    public void startBatchProcessing() {
        if (batchRunning) return;
        List<Document> docs = storage.getAllDocuments();
        batchTotal = docs.size();
        batchProgress.set(0);
        batchRunning = true;
        logService.info("Batch processing started for " + batchTotal + " documents");

        for (Document doc : docs) {
            batchExecutor.submit(() -> {
                try {
                    File file = new File(doc.getStoragePath());
                    if (file.exists()) processDocument(doc, file);
                    storage.saveDocument(doc);
                } catch (Exception e) {
                    logService.error("Batch error for " + doc.getFileName() + ": " + e.getMessage());
                } finally {
                    int done = batchProgress.incrementAndGet();
                    if (done >= batchTotal) {
                        batchRunning = false;
                        logService.info("Batch processing complete. " + batchTotal + " files processed.");
                    }
                }
            });
        }
    }

    public int getBatchProgress() {
        return batchTotal == 0 ? 0 : (int) ((batchProgress.get() * 100.0) / batchTotal);
    }

    public boolean isBatchRunning() { return batchRunning; }

    private String getExtension(String filename) {
        int dot = filename.lastIndexOf('.');
        return dot >= 0 ? filename.substring(dot + 1).toLowerCase() : "bin";
    }

    private String formatSize(long bytes) {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return String.format("%.1f KB", bytes / 1024.0);
        return String.format("%.1f MB", bytes / (1024.0 * 1024));
    }
}

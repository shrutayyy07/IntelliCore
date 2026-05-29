package com.intellicore.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;

public class Document {
    private String id;
    private String fileName;
    private String fileType;
    private String ext;
    private long fileSize;
    private int pages;
    private double confidenceScore;
    private String status; // UPLOADED, PROCESSING, APPROVED, REJECTED
    private String uploadedBy;
    private boolean blurry;
    private String storagePath;

    @JsonFormat(pattern = "dd MMM yyyy, HH:mm")
    private LocalDateTime uploadedAt;

    private DocumentMetadata metadata;

    public Document() {
        this.uploadedAt = LocalDateTime.now();
        this.status = "UPLOADED";
        this.confidenceScore = 0.0;
    }

    // Getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }

    public String getExt() { return ext; }
    public void setExt(String ext) { this.ext = ext; }

    public long getFileSize() { return fileSize; }
    public void setFileSize(long fileSize) { this.fileSize = fileSize; }

    public int getPages() { return pages; }
    public void setPages(int pages) { this.pages = pages; }

    public double getConfidenceScore() { return confidenceScore; }
    public void setConfidenceScore(double confidenceScore) { this.confidenceScore = confidenceScore; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getUploadedBy() { return uploadedBy; }
    public void setUploadedBy(String uploadedBy) { this.uploadedBy = uploadedBy; }

    public boolean isBlurry() { return blurry; }
    public void setBlurry(boolean blurry) { this.blurry = blurry; }

    public String getStoragePath() { return storagePath; }
    public void setStoragePath(String storagePath) { this.storagePath = storagePath; }

    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }

    public DocumentMetadata getMetadata() { return metadata; }
    public void setMetadata(DocumentMetadata metadata) { this.metadata = metadata; }
}

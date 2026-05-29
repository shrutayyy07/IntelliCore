package com.intellicore.service;

import com.intellicore.model.DocumentMetadata;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDDocumentInformation;
import org.apache.tika.Tika;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.stream.ImageInputStream;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.util.Iterator;

@Service
public class MetadataService {

    private static final Logger logger = LoggerFactory.getLogger(MetadataService.class);
    private final Tika tika = new Tika();

    public String detectMimeType(File file) {
        try {
            return tika.detect(file);
        } catch (IOException e) {
            logger.warn("Could not detect MIME for {}: {}", file.getName(), e.getMessage());
            return "application/octet-stream";
        }
    }

    public DocumentMetadata extractPdfMetadata(File file) {
        DocumentMetadata meta = new DocumentMetadata();
        try (PDDocument doc = Loader.loadPDF(file)) {
            PDDocumentInformation info = doc.getDocumentInformation();
            meta.setTitle(info.getTitle());
            meta.setAuthor(info.getAuthor());
            meta.setCreator(info.getCreator());
            meta.setProducer(info.getProducer());
            if (info.getCreationDate() != null)
                meta.setCreationDate(info.getCreationDate().getTime().toString());
            if (info.getModificationDate() != null)
                meta.setModificationDate(info.getModificationDate().getTime().toString());
        } catch (IOException e) {
            logger.warn("PDF metadata extraction failed: {}", e.getMessage());
        }
        return meta;
    }

    public DocumentMetadata extractImageMetadata(File file) {
        DocumentMetadata meta = new DocumentMetadata();
        try {
            BufferedImage img = ImageIO.read(file);
            if (img != null) {
                meta.setWidth(img.getWidth());
                meta.setHeight(img.getHeight());
                meta.setColorSpace(img.getColorModel().getColorSpace().getType() == 1 ? "GRAY" : "RGB");
            }
        } catch (IOException e) {
            logger.warn("Image metadata extraction failed: {}", e.getMessage());
        }
        return meta;
    }

    public int getPdfPageCount(File file) {
        try (PDDocument doc = Loader.loadPDF(file)) {
            return doc.getNumberOfPages();
        } catch (IOException e) {
            return 0;
        }
    }
}

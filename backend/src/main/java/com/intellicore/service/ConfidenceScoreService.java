package com.intellicore.service;

import com.intellicore.model.Document;
import org.springframework.stereotype.Service;

/**
 * AI Performance Model using Fuzzy Logic to compute a confidence score.
 * Score ranges from 0 to 100. Score < 70 flags the document as REJECTED.
 */
@Service
public class ConfidenceScoreService {

    /**
     * Computes a confidence score using fuzzy logic principles.
     * Factors: file size validity, metadata completeness, blur (for images), page count.
     */
    public double computeScore(Document doc, boolean blurry, boolean hasMetadata) {
        double score = 0.0;

        // Factor 1: File type known (0-25 pts)
        score += fuzzyFileType(doc.getFileType());

        // Factor 2: File size in valid range (0-25 pts)
        score += fuzzyFileSize(doc.getFileSize());

        // Factor 3: Metadata completeness (0-25 pts)
        score += fuzzyMetadata(hasMetadata, doc.getMetadata());

        // Factor 4: Image clarity / page count (0-25 pts)
        if (isImage(doc.getExt())) {
            score += fuzzyClarity(blurry);
        } else {
            score += fuzzyPages(doc.getPages());
        }

        return Math.min(100.0, Math.max(0.0, score));
    }

    private double fuzzyFileType(String fileType) {
        if (fileType == null) return 0;
        return switch (fileType.toLowerCase()) {
            case "application/pdf" -> 25.0;
            case "image/png", "image/jpeg", "image/jpg" -> 22.0;
            case "image/gif", "image/bmp" -> 15.0;
            default -> 8.0;
        };
    }

    private double fuzzyFileSize(long sizeBytes) {
        long kb = sizeBytes / 1024;
        if (kb < 1) return 0;        // too small
        if (kb < 10) return 10.0;    // very small
        if (kb < 100) return 20.0;   // small
        if (kb < 10240) return 25.0; // normal (< 10 MB)
        if (kb < 51200) return 18.0; // large (< 50 MB)
        return 10.0;                 // very large
    }

    private double fuzzyMetadata(boolean hasMetadata, com.intellicore.model.DocumentMetadata meta) {
        if (!hasMetadata || meta == null) return 5.0;
        int populated = 0;
        if (meta.getTitle() != null && !meta.getTitle().isBlank()) populated++;
        if (meta.getAuthor() != null && !meta.getAuthor().isBlank()) populated++;
        if (meta.getCreator() != null) populated++;
        if (meta.getCreationDate() != null) populated++;
        return switch (populated) {
            case 0 -> 5.0;
            case 1 -> 10.0;
            case 2 -> 15.0;
            case 3 -> 20.0;
            default -> 25.0;
        };
    }

    private double fuzzyClarity(boolean blurry) {
        return blurry ? 5.0 : 25.0;
    }

    private double fuzzyPages(int pages) {
        if (pages <= 0) return 5.0;
        if (pages == 1) return 15.0;
        if (pages <= 10) return 20.0;
        return 25.0;
    }

    private boolean isImage(String ext) {
        if (ext == null) return false;
        return switch (ext.toLowerCase()) {
            case "png", "jpg", "jpeg", "gif", "bmp", "webp" -> true;
            default -> false;
        };
    }

    /**
     * Validation rule engine: flags document if score < 70
     */
    public String determineStatus(double score) {
        return score >= 70.0 ? "APPROVED" : "REJECTED";
    }
}

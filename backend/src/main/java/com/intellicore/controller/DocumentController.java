package com.intellicore.controller;

import com.intellicore.model.Document;
import com.intellicore.service.DocumentService;
import io.jsonwebtoken.Claims;
import com.intellicore.security.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    @Autowired private DocumentService documentService;
    @Autowired private JwtService jwtService;

    @GetMapping
    public ResponseEntity<List<Document>> getAll() {
        return ResponseEntity.ok(documentService.getAllDocuments());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable String id) {
        Optional<Document> doc = documentService.getDocument(id);
        return doc.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Admin-only: returns full document JSON including raw metadata
     */
    @GetMapping("/{id}/full")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getFullById(@PathVariable String id) {
        return documentService.getDocument(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/upload")
    public ResponseEntity<?> upload(
            @RequestParam("file") MultipartFile file,
            HttpServletRequest request) {
        try {
            String uploadedBy = extractUserId(request);
            Document doc = documentService.uploadDocument(file, uploadedBy);
            return ResponseEntity.ok(doc);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable String id) {
        documentService.deleteDocument(id);
        return ResponseEntity.ok(Map.of("message", "Document deleted"));
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        List<Document> docs = documentService.getAllDocuments();
        long total = docs.size();
        long approved = docs.stream().filter(d -> "APPROVED".equals(d.getStatus())).count();
        long rejected = docs.stream().filter(d -> "REJECTED".equals(d.getStatus())).count();
        double avgScore = docs.stream().mapToDouble(Document::getConfidenceScore).average().orElse(0);

        return ResponseEntity.ok(Map.of(
            "total", total,
            "approved", approved,
            "rejected", rejected,
            "averageScore", Math.round(avgScore)
        ));
    }

    private String extractUserId(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            try {
                Claims claims = jwtService.parseToken(header.substring(7));
                return claims.getSubject();
            } catch (Exception ignored) {}
        }
        return "anonymous";
    }
}

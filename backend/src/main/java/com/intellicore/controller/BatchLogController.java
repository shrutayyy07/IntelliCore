package com.intellicore.controller;

import com.intellicore.model.LogEntry;
import com.intellicore.service.DocumentService;
import com.intellicore.service.LogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class BatchLogController {

    @Autowired private DocumentService documentService;
    @Autowired private LogService logService;

    // ── Batch ─────────────────────────────────────────────────────────────────

    @PostMapping("/batch/process")
    public ResponseEntity<?> startBatch() {
        documentService.startBatchProcessing();
        return ResponseEntity.ok(Map.of("message", "Batch processing started"));
    }

    @GetMapping("/batch/progress")
    public ResponseEntity<?> getBatchProgress() {
        return ResponseEntity.ok(Map.of(
            "progress", documentService.getBatchProgress(),
            "running",  documentService.isBatchRunning()
        ));
    }

    // ── Logs ──────────────────────────────────────────────────────────────────

    @GetMapping("/logs")
    public ResponseEntity<List<LogEntry>> getLogs() {
        return ResponseEntity.ok(logService.getLogs());
    }

    @DeleteMapping("/logs")
    public ResponseEntity<?> clearLogs() {
        logService.clear();
        return ResponseEntity.ok(Map.of("message", "Logs cleared"));
    }

    // ── Health — Railway polls this; must respond in < 1 s ───────────────────
    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok(Map.of(
            "status",  "UP",
            "service", "IntelliCore",
            "version", "1.0.0"
        ));
    }
}

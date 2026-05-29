package com.intellicore.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.util.concurrent.TimeUnit;

@Service
public class PythonInteropService {

    private static final Logger logger = LoggerFactory.getLogger(PythonInteropService.class);

    @Value("${python.script.path:./src/main/python/blur_detection.py}")
    private String scriptPath;

    @Value("${python.executable:python3}")
    private String pythonExecutable;

    private final ObjectMapper mapper = new ObjectMapper();

    public record BlurResult(boolean blurry, double score, String status, String error) {}

    public BlurResult detectBlur(File imageFile) {
        logger.info("[ProcessBuilder] Running blur detection on: {}", imageFile.getName());
        try {
            ProcessBuilder pb = new ProcessBuilder(
                    pythonExecutable, scriptPath, imageFile.getAbsolutePath()
            );
            pb.redirectErrorStream(true);
            Process process = pb.start();

            StringBuilder output = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    output.append(line);
                }
            }

            boolean finished = process.waitFor(30, TimeUnit.SECONDS);
            if (!finished) {
                process.destroyForcibly();
                logger.warn("Python script timed out for: {}", imageFile.getName());
                return new BlurResult(false, -1, "timeout", "Script timed out");
            }

            String json = output.toString().trim();
            if (json.isEmpty()) {
                return new BlurResult(false, -1, "error", "No output from script");
            }

            JsonNode node = mapper.readTree(json);
            boolean blurry = node.path("blurry").asBoolean(false);
            double score = node.path("score").asDouble(-1);
            String status = node.path("status").asText("unknown");
            String error = node.path("error").asText(null);

            logger.info("[ProcessBuilder] Result for {}: blurry={}, score={}", imageFile.getName(), blurry, score);
            return new BlurResult(blurry, score, status, error);

        } catch (Exception e) {
            logger.error("[ProcessBuilder] Failed to run python script: {}", e.getMessage());
            return new BlurResult(false, -1, "error", e.getMessage());
        }
    }
}

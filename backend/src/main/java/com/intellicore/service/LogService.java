package com.intellicore.service;

import com.intellicore.model.LogEntry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class LogService {

    private static final Logger logger = LoggerFactory.getLogger("VisionRequest");
    private final List<LogEntry> logs = new CopyOnWriteArrayList<>();
    private static final int MAX_LOGS = 500;

    public void info(String message) {
        addLog("INFO", message);
        logger.info(message);
    }

    public void warn(String message) {
        addLog("WARN", message);
        logger.warn(message);
    }

    public void error(String message) {
        addLog("ERROR", message);
        logger.error(message);
    }

    public void visionRequest(String fileName, String result) {
        String msg = "Vision Request | file=" + fileName + " | result=" + result;
        addLog("VISION", msg);
        logger.info("[VISION] {}", msg);
    }

    private void addLog(String level, String message) {
        if (logs.size() >= MAX_LOGS) {
            logs.remove(0);
        }
        logs.add(new LogEntry(level, message));
    }

    public List<LogEntry> getLogs() {
        List<LogEntry> copy = new ArrayList<>(logs);
        Collections.reverse(copy);
        return copy;
    }

    public void clear() {
        logs.clear();
    }
}

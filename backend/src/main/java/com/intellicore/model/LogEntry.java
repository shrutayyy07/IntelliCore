package com.intellicore.model;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class LogEntry {
    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("HH:mm:ss");

    private String timestamp;
    private String level;
    private String message;

    public LogEntry(String level, String message) {
        this.timestamp = LocalDateTime.now().format(FMT);
        this.level = level;
        this.message = message;
    }

    public String getTimestamp() { return timestamp; }
    public String getLevel() { return level; }
    public String getMessage() { return message; }

    @Override
    public String toString() {
        return "[" + timestamp + "] " + level + " — " + message;
    }
}

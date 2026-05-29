package com.intellicore.storage;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.intellicore.model.Document;
import com.intellicore.model.User;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class FlatFileStorageService {

    @Value("${storage.path:./data}")
    private String storagePath;

    private final ObjectMapper mapper;
    private final Map<String, Document> documentCache = new ConcurrentHashMap<>();
    private final Map<String, User> userCache = new ConcurrentHashMap<>();

    public FlatFileStorageService() {
        this.mapper = new ObjectMapper();
        this.mapper.registerModule(new JavaTimeModule());
    }

    @PostConstruct
    public void init() throws IOException {
        Path dataDir = Paths.get(storagePath);
        Path uploadsDir = dataDir.resolve("uploads");
        Files.createDirectories(dataDir);
        Files.createDirectories(uploadsDir);
        loadDocuments();
        loadUsers();
    }

    // --- Documents ---
    public List<Document> getAllDocuments() {
        return new ArrayList<>(documentCache.values());
    }

    public Optional<Document> getDocument(String id) {
        return Optional.ofNullable(documentCache.get(id));
    }

    public Document saveDocument(Document doc) {
        if (doc.getId() == null) doc.setId(UUID.randomUUID().toString());
        documentCache.put(doc.getId(), doc);
        persistDocuments();
        return doc;
    }

    public void deleteDocument(String id) {
        documentCache.remove(id);
        persistDocuments();
    }

    // --- Users ---
    public Optional<User> getUserByPhone(String phone) {
        return userCache.values().stream().filter(u -> phone.equals(u.getPhone())).findFirst();
    }

    public User saveUser(User user) {
        if (user.getId() == null) user.setId(UUID.randomUUID().toString());
        userCache.put(user.getId(), user);
        persistUsers();
        return user;
    }

    public Path getUploadPath() {
        return Paths.get(storagePath, "uploads");
    }

    // --- Persistence ---
    private void loadDocuments() {
        File f = Paths.get(storagePath, "documents.json").toFile();
        if (!f.exists()) return;
        try {
            List<Document> docs = mapper.readValue(f, new TypeReference<>() {});
            docs.forEach(d -> documentCache.put(d.getId(), d));
        } catch (IOException ignored) {}
    }

    private void persistDocuments() {
        try {
            mapper.writeValue(Paths.get(storagePath, "documents.json").toFile(),
                    new ArrayList<>(documentCache.values()));
        } catch (IOException ignored) {}
    }

    private void loadUsers() {
        File f = Paths.get(storagePath, "users.json").toFile();
        if (!f.exists()) return;
        try {
            List<User> users = mapper.readValue(f, new TypeReference<>() {});
            users.forEach(u -> userCache.put(u.getId(), u));
        } catch (IOException ignored) {}
    }

    private void persistUsers() {
        try {
            mapper.writeValue(Paths.get(storagePath, "users.json").toFile(),
                    new ArrayList<>(userCache.values()));
        } catch (IOException ignored) {}
    }
}

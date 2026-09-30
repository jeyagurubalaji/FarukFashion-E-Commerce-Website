package com.farukfashion.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;

@RestController
@RequestMapping("/admin/upload")
@PreAuthorize("hasRole('ADMIN')")
@Slf4j
public class FileUploadController {

    private final Path uploadDir;

    public FileUploadController(@Value("${app.upload-dir:uploads}") String uploadDirPath) {
        Path dir = Paths.get(uploadDirPath).toAbsolutePath().normalize();
        try {
            Files.createDirectories(dir);
        } catch (Exception e) {
            // Render/Docker: /app may be read-only — use temp folder
            Path fallback = Paths.get(System.getProperty("java.io.tmpdir"), "faruk-fashion-uploads");
            try {
                Files.createDirectories(fallback);
                log.warn("Cannot use '{}': {}. Using fallback: {}", dir, e.getMessage(), fallback);
                dir = fallback;
            } catch (IOException ex) {
                throw new IllegalStateException("Cannot create upload directory", ex);
            }
        }
        this.uploadDir = dir;
        log.info("Upload directory: {}", this.uploadDir);
    }

    @PostMapping(value = "/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new RuntimeException("Only image files are allowed");
        }

        if (file.getSize() > 5 * 1024 * 1024) {
            throw new RuntimeException("File size must be under 5 MB");
        }

        try {
            String original = file.getOriginalFilename();
            String ext = "";
            if (original != null && original.contains(".")) {
                ext = original.substring(original.lastIndexOf("."));
            }
            String filename = UUID.randomUUID().toString().replace("-", "") + ext;
            Path target = uploadDir.resolve(filename);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

            String url = "/api/uploads/" + filename;

            Map<String, String> result = new HashMap<>();
            result.put("url", url);
            result.put("filename", filename);
            result.put("originalName", original);
            return ResponseEntity.ok(result);
        } catch (IOException e) {
            log.error("Upload failed", e);
            throw new RuntimeException("Failed to upload file");
        }
    }

    @PostMapping(value = "/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<List<Map<String, String>>> uploadMultiple(@RequestParam("files") MultipartFile[] files) {
        List<Map<String, String>> results = new ArrayList<>();
        for (MultipartFile file : files) {
            if (!file.isEmpty()) {
                results.add(uploadImage(file).getBody());
            }
        }
        return ResponseEntity.ok(results);
    }
}
package com.farukfashion.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.upload-dir:uploads}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path dir = Paths.get(uploadDir).toAbsolutePath().normalize();
        if (!Files.isDirectory(dir)) {
            dir = Paths.get(System.getProperty("java.io.tmpdir"), "faruk-fashion-uploads");
        }
        String location = "file:" + dir + "/";
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(location);
    }
}
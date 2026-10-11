package com.farukfashion.controller;

import com.farukfashion.service.EmailService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/contact")
@RequiredArgsConstructor
@Slf4j
public class ContactController {

    private final EmailService emailService;

    @Value("${app.support-phone:+91 6369456650}")
    private String supportPhone;

    @Value("${app.support-email}")
    private String supportEmail;

    @PostMapping
    public ResponseEntity<Map<String, String>> contact(@RequestBody ContactRequest request) {
        CompletableFuture.runAsync(() ->
                emailService.sendContactForm(
                        request.getName(),
                        request.getEmail(),
                        request.getPhone(),
                        request.getSubject(),
                        request.getMessage()
                )
        );

        return ResponseEntity.ok(Map.of(
                "message", "Thank you! We will get back to you within 24 hours.",
                "supportPhone", supportPhone
        ));
    }

    @GetMapping("/info")
    public ResponseEntity<Map<String, Object>> info() {
        return ResponseEntity.ok(Map.of(
                "storeName", "Faruk Fashion",
                "tagline", "Style That Speaks",
                "address", "35, Kamarajar Street, Thenkarai, Periyakulam-625 601",
                "phone", supportPhone,
                "whatsapp", supportPhone,
                "email", supportEmail,
                "supportHours", "24×7 Customer Support",
                "about", "Faruk Fashion offers premium quality Handbags, Trolley Bags, School Bags, " +
                        "College Bags, Kids Bags, Office Bags, Sling Bags and Travelling Kits. " +
                        "We believe in Style That Speaks – combining classic elegance with modern durability."
        ));
    }

    @Data
    public static class ContactRequest {
        private String name;
        private String email;
        private String phone;
        private String subject;
        private String message;
    }
}
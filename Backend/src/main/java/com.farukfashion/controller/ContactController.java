package com.farukfashion.controller;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/contact")
@RequiredArgsConstructor
@Slf4j
public class ContactController {

    private final JavaMailSender mailSender;

    @Value("${app.support-email}")
    private String supportEmail;

    @PostMapping
    public ResponseEntity<Map<String, String>> contact(@RequestBody ContactRequest request) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(supportEmail);
            message.setSubject("Contact Form: " + request.getSubject());
            message.setText("From: " + request.getName() + " <" + request.getEmail() + ">\n" +
                    "Phone: " + request.getPhone() + "\n\n" + request.getMessage());
            mailSender.send(message);
        } catch (Exception e) {
            log.warn("Contact email failed (check mail config): {}", e.getMessage());
        }
        return ResponseEntity.ok(Map.of(
                "message", "Thank you! We will get back to you within 24 hours.",
                "supportPhone", "+91 93442 82751"
        ));
    }

    @GetMapping("/info")
    public ResponseEntity<Map<String, Object>> info() {
        return ResponseEntity.ok(Map.of(
                "storeName", "Faruk Fashion",
                "tagline", "Style That Speaks",
                "address", "35, Kamarajar Street, Thenkarai, Periyakulam-625 601",
                "phone", "+91 93442 82751",
                "whatsapp", "+91 93442 82751",
                "email", "support@farukfashion.com",
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

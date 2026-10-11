package com.farukfashion.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class EmailService {

    @Value("${resend.api-key:}")
    private String resendApiKey;

    @Value("${app.support-email}")
    private String supportEmail;

    private final RestTemplate restTemplate = new RestTemplate();

    public void send(String to, String subject, String textBody) {
        if (resendApiKey == null || resendApiKey.isBlank()) {
            log.warn("RESEND_API_KEY not set — email skipped");
            return;
        }
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(resendApiKey);

            Map<String, Object> body = Map.of(
                    "from", "Faruk Fashion <onboarding@resend.dev>",
                    "to", List.of(to),
                    "subject", subject,
                    "text", textBody
            );

            ResponseEntity<String> res = restTemplate.exchange(
                    "https://api.resend.com/emails",
                    HttpMethod.POST,
                    new HttpEntity<>(body, headers),
                    String.class
            );
            log.info("Email sent via Resend to {} status={}", to, res.getStatusCode());
        } catch (Exception e) {
            log.error("Resend email failed: {}", e.getMessage());
        }
    }

    public void sendContactForm(String name, String email, String phone, String subject, String message) {
        String text = "From: " + name + " <" + email + ">\n"
                + "Phone: " + (phone != null ? phone : "") + "\n\n"
                + message;
        send(supportEmail, "Contact Form: " + subject, text);
    }
}
package com.farukfashion.service;

import com.farukfashion.model.PasswordOtp;
import com.farukfashion.model.User;
import com.farukfashion.repository.PasswordOtpRepository;
import com.farukfashion.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordOtpRepository otpRepository;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;

    public Map<String, String> sendOtp(String email) {
        String normalized = email.toLowerCase().trim();
        User user = userRepository.findByEmail(normalized)
                .orElseThrow(() -> new RuntimeException("No account found with this email"));

        String otp = String.format("%06d", new Random().nextInt(1_000_000));

        otpRepository.deleteByEmail(normalized);
        otpRepository.save(PasswordOtp.builder()
                .email(normalized)
                .otp(otp)
                .verified(false)
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusMinutes(10))
                .build());

        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setTo(normalized);
            msg.setSubject("Faruk Fashion – Password Reset OTP");
            msg.setText(
                    "Hello " + (user.getFirstName() != null ? user.getFirstName() : "") + ",\n\n" +
                            "Your OTP to reset password is: " + otp + "\n\n" +
                            "Valid for 10 minutes. Do not share this code.\n\n" +
                            "— Faruk Fashion"
            );
            mailSender.send(msg);
            log.info("Password OTP sent to {}", normalized);
        } catch (Exception e) {
            log.error("Failed to send OTP email to {}: {}", normalized, e.getMessage());
            log.warn("DEV OTP for {} = {} (email failed; use this OTP)", normalized, otp);
            return Map.of(
                    "message", "OTP generated. If email did not arrive, check server console (dev).",
                    "email", normalized
            );
        }

        return Map.of("message", "OTP sent to your email", "email", normalized);
    }

    public Map<String, String> verifyOtp(String email, String otp) {
        String normalized = email.toLowerCase().trim();
        PasswordOtp record = otpRepository.findTopByEmailOrderByCreatedAtDesc(normalized)
                .orElseThrow(() -> new RuntimeException("No OTP found. Please request a new one."));

        if (record.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP expired. Please request a new one.");
        }
        if (!record.getOtp().equals(otp.trim())) {
            throw new RuntimeException("Invalid OTP");
        }

        record.setVerified(true);
        otpRepository.save(record);
        return Map.of("message", "OTP verified", "email", normalized);
    }

    public Map<String, String> resetPassword(String email, String otp, String newPassword) {
        String normalized = email.toLowerCase().trim();
        if (newPassword == null || newPassword.length() < 6) {
            throw new RuntimeException("Password must be at least 6 characters");
        }

        PasswordOtp record = otpRepository.findTopByEmailOrderByCreatedAtDesc(normalized)
                .orElseThrow(() -> new RuntimeException("No OTP found. Please start again."));

        if (record.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP expired. Please request a new one.");
        }
        if (!record.getOtp().equals(otp.trim())) {
            throw new RuntimeException("Invalid OTP");
        }
        if (!record.isVerified()) {
            throw new RuntimeException("Please verify OTP first");
        }

        User user = userRepository.findByEmail(normalized)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        otpRepository.deleteByEmail(normalized);

        return Map.of("message", "Password updated successfully. You can login now.");
    }
}
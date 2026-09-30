package com.farukfashion.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "password_otps")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PasswordOtp {
    @Id
    private String id;

    @Indexed
    private String email;

    private String otp;

    private boolean verified;

    private LocalDateTime expiresAt;

    private LocalDateTime createdAt;
}
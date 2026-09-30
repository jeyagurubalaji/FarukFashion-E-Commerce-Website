package com.farukfashion.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.List;

public class AuthDTOs {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RegisterRequest {
        @NotBlank @Email
        private String email;

        @NotBlank @Size(min = 10, max = 15)
        private String phone;

        @NotBlank @Size(min = 6, max = 50)
        private String password;

        @NotBlank
        private String firstName;
        private String lastName;

        private List<String> preferredCategories;
        private List<String> preferredColors;
        private String preferredStyle;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoginRequest {
        @NotBlank
        private String emailOrPhone;

        @NotBlank
        private String password;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AuthResponse {
        private String accessToken;
        private String refreshToken;
        private String userId;
        private String email;
        private String fullName;
        private String role;
        private List<String> preferredCategories;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateProfileRequest {
        private String firstName;
        private String lastName;
        private String address;
        private String city;
        private String state;
        private String pincode;
        private List<String> preferredCategories;
        private List<String> preferredColors;
        private String preferredStyle;
        private Integer ageGroup;
    }
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ForgotPasswordRequest {
        @NotBlank @Email
        private String email;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VerifyOtpRequest {
        @NotBlank @Email
        private String email;
        @NotBlank
        private String otp;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResetPasswordRequest {
        @NotBlank @Email
        private String email;
        @NotBlank
        private String otp;
        @NotBlank @Size(min = 6, max = 50)
        private String newPassword;
    }
}

package com.farukfashion.service;

import com.farukfashion.dto.AuthDTOs.*;
import com.farukfashion.model.User;
import com.farukfashion.repository.UserRepository;
import com.farukfashion.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final LogService logService;

    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new RuntimeException("Email already registered");
        }
        if (userRepository.existsByPhone(req.getPhone())) {
            throw new RuntimeException("Phone number already registered");
        }

        User user = User.builder()
                .email(req.getEmail().toLowerCase().trim())
                .phone(req.getPhone().trim())
                .password(passwordEncoder.encode(req.getPassword()))
                .firstName(req.getFirstName())
                .lastName(req.getLastName())
                .preferredCategories(req.getPreferredCategories())
                .preferredColors(req.getPreferredColors())
                .preferredStyle(req.getPreferredStyle())
                .roles(Set.of(User.Role.CUSTOMER))
                .active(true)
                .build();

        user = userRepository.save(user);

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), "CUSTOMER");
        String refresh = jwtUtil.generateRefreshToken(user.getId());

        return AuthResponse.builder()
                .accessToken(token)
                .refreshToken(refresh)
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role("CUSTOMER")
                .preferredCategories(user.getPreferredCategories())
                .build();
    }

    public AuthResponse login(LoginRequest req, HttpServletRequest request) {
        String input = req.getEmailOrPhone() != null ? req.getEmailOrPhone().trim() : "";
        String emailKey = input.toLowerCase();

        User user = userRepository.findByEmail(emailKey)
                .or(() -> userRepository.findByPhone(input))
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        if (!user.isActive()) {
            throw new RuntimeException("Account is deactivated. Contact support.");
        }

        // Update last login — ignore errors so login still returns fast
        try {
            user.setLastLoginAt(LocalDateTime.now());
            userRepository.save(user);
        } catch (Exception ignored) {
        }

        String role = user.getRoles() != null
                ? user.getRoles().stream().findFirst().map(Enum::name).orElse("CUSTOMER")
                : "CUSTOMER";

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), role);
        String refresh = jwtUtil.generateRefreshToken(user.getId());

        // Log after tokens — never block or fail login
        try {
            logService.logLogin(user.getId(), user.getEmail(), user.getPhone(), true, "LOGIN_SUCCESS", request);
        } catch (Exception ignored) {
        }

        return AuthResponse.builder()
                .accessToken(token)
                .refreshToken(refresh)
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(role)
                .preferredCategories(user.getPreferredCategories())
                .build();
    }

    public User updateProfile(String userId, UpdateProfileRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (req.getFirstName() != null) user.setFirstName(req.getFirstName());
        if (req.getLastName() != null) user.setLastName(req.getLastName());
        if (req.getAddress() != null) user.setAddress(req.getAddress());
        if (req.getCity() != null) user.setCity(req.getCity());
        if (req.getState() != null) user.setState(req.getState());
        if (req.getPincode() != null) user.setPincode(req.getPincode());
        if (req.getPreferredCategories() != null) user.setPreferredCategories(req.getPreferredCategories());
        if (req.getPreferredColors() != null) user.setPreferredColors(req.getPreferredColors());
        if (req.getPreferredStyle() != null) user.setPreferredStyle(req.getPreferredStyle());
        if (req.getAgeGroup() != null) user.setAgeGroup(req.getAgeGroup());

        return userRepository.save(user);
    }

    public User getUser(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    /** Creates/resets admin — used by /api/auth/setup-admin */
    public Map<String, String> setupAdmin() {
        String email = "admin@farukfashion.com";
        String phone = "9000000001";
        String rawPassword = "admin123";

        userRepository.findByEmail(email).ifPresent(userRepository::delete);
        userRepository.findByPhone(phone).ifPresent(userRepository::delete);

        User admin = User.builder()
                .email(email)
                .phone(phone)
                .password(passwordEncoder.encode(rawPassword))
                .firstName("Faruk")
                .lastName("Admin")
                .roles(Set.of(User.Role.ADMIN))
                .active(true)
                .emailVerified(true)
                .build();

        admin = userRepository.save(admin);

        return Map.of(
                "message", "Admin ready — you can login now",
                "email", email,
                "password", rawPassword,
                "userId", admin.getId() != null ? admin.getId() : "",
                "loginUrl", "http://localhost:3000/login"
        );
    }
}
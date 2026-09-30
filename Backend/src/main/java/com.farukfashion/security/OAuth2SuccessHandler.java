package com.farukfashion.security;

import com.farukfashion.model.User;
import com.farukfashion.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.Set;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();
        String email = oauthUser.getAttribute("email");
        String name = oauthUser.getAttribute("name");
        String sub = oauthUser.getAttribute("sub");

        if (email == null || email.isBlank()) {
            getRedirectStrategy().sendRedirect(request, response, frontendUrl + "/login?error=no_email");
            return;
        }

        String normalized = email.toLowerCase().trim();
        User user = userRepository.findByEmail(normalized).orElse(null);

        if (user == null) {
            String first = "User";
            String last = "";
            if (name != null && !name.isBlank()) {
                String[] parts = name.trim().split("\\s+", 2);
                first = parts[0];
                if (parts.length > 1) last = parts[1];
            }

            String digits = sub != null ? sub.replaceAll("\\D", "") : UUID.randomUUID().toString().replace("-", "");
            if (digits.length() > 14) {
                digits = digits.substring(0, 14);
            }
            String phone = "g" + digits;

            user = User.builder()
                    .email(normalized)
                    .phone(phone)
                    .password(new BCryptPasswordEncoder().encode(UUID.randomUUID().toString()))
                    .firstName(first)
                    .lastName(last)
                    .roles(Set.of(User.Role.CUSTOMER))
                    .emailVerified(true)
                    .active(true)
                    .build();
            user = userRepository.save(user);
        }

        String role = "CUSTOMER";
        if (user.getRoles() != null && !user.getRoles().isEmpty()) {
            role = user.getRoles().iterator().next().name();
        }

        String accessToken = jwtUtil.generateToken(user.getId(), user.getEmail(), role);

        String redirect = UriComponentsBuilder
                .fromUriString(frontendUrl + "/oauth-callback")
                .queryParam("token", accessToken)
                .build()
                .toUriString();

        getRedirectStrategy().sendRedirect(request, response, redirect);
    }
}
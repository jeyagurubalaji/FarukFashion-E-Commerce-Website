package com.farukfashion.config;

import com.farukfashion.model.User;
import com.farukfashion.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.findByEmail("admin@farukfashion.com").isEmpty()) {
            seedAdmin();
            log.info("Admin user created: admin@farukfashion.com / admin123");
        }
    }

    private void seedAdmin() {
        User admin = User.builder()
                .email("admin@farukfashion.com")
                .phone("6369456650")
                .password(passwordEncoder.encode("admin123"))
                .firstName("Faruk")
                .lastName("Admin")
                .roles(Set.of(User.Role.ADMIN))
                .active(true)
                .build();
        userRepository.save(admin);
    }
}
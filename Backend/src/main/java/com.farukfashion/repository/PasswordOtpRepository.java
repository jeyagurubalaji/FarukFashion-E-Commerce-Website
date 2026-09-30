package com.farukfashion.repository;

import com.farukfashion.model.PasswordOtp;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface PasswordOtpRepository extends MongoRepository<PasswordOtp, String> {
    Optional<PasswordOtp> findTopByEmailOrderByCreatedAtDesc(String email);
    void deleteByEmail(String email);
}
package com.farukfashion.model;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Document(collection = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    private String id;

    @Indexed(unique = true)
    private String email;

    @Indexed(unique = true)
    private String phone;

    private String password;

    private String firstName;
    private String lastName;

    private String address;
    private String city;
    private String state;
    private String pincode;

    @Builder.Default
    private Set<Role> roles = new HashSet<>(Set.of(Role.CUSTOMER));

    // Personalization preferences
    private List<String> preferredCategories;   // Handbags, School Bags, etc.
    private List<String> preferredColors;
    private String preferredStyle;              // Classic, Modern, Kids, etc.
    private Integer ageGroup;                   // for kids bags suggestions

    private boolean active = true;
    private boolean emailVerified = false;
    private boolean phoneVerified = false;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    private LocalDateTime lastLoginAt;

    public enum Role {
        CUSTOMER, ADMIN, SUPPORT
    }

    public String getFullName() {
        return (firstName != null ? firstName : "") + " " + (lastName != null ? lastName : "");
    }
}

package com.farukfashion.model;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Document(collection = "products")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Product {

    @Id
    private String id;

    @Indexed
    private String name;

    private String description;
    private String shortDescription;

    @Indexed
    private Category category;

    private List<String> subCategories;     // e.g. Sling, Tote, Backpack

    private BigDecimal price;
    private BigDecimal discountPrice;       // after offer
    private Integer discountPercent;

    private Integer gstPercent;
    // Inventory
    private Integer stockQuantity;
    private Integer lowStockThreshold;      // alert when below this
    private boolean inStock;

    private List<String> images;            // URLs or base64
    private String mainImage;

    private List<String> colors;
    private List<String> sizes;             // if applicable
    private Map<String, String> specifications; // Material, Capacity, Weight etc.

    private String brand;                   // Faruk Fashion
    private Double rating;
    private Integer reviewCount;

    private boolean featured;
    private boolean active;

    // For personalization
    private List<String> tags;              // kids, travel, office, elegant, etc.
    private String targetAudience;          // Men, Women, Kids, Unisex

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public enum Category {
        HANDBAGS,
        TROLLEY_BAGS,
        SCHOOL_BAGS,
        COLLEGE_BAGS,
        KIDS_BAGS,
        OFFICE_BAGS,
        SLING_BAGS,
        TRAVELLING_KIT,
        LAPTOP_BAGS,
        OTHER
    }

    public void updateStockStatus() {
        this.inStock = this.stockQuantity != null && this.stockQuantity > 0;
    }

    public boolean isLowStock() {
        return stockQuantity != null && lowStockThreshold != null
                && stockQuantity <= lowStockThreshold;
    }
}

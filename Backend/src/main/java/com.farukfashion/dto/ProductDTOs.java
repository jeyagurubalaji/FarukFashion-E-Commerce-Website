package com.farukfashion.dto;

import com.farukfashion.model.Product;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class ProductDTOs {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductResponse {
        private String id;
        private String name;
        private String description;
        private String shortDescription;
        private Product.Category category;
        private List<String> subCategories;
        private BigDecimal price;
        private BigDecimal discountPrice;
        private Integer discountPercent;
        private Integer gstPercent;
        private Integer stockQuantity;
        private boolean inStock;
        private List<String> images;
        private String mainImage;
        private List<String> colors;
        private List<String> sizes;
        private Map<String, String> specifications;
        private String brand;
        private Double rating;
        private Integer reviewCount;
        private boolean featured;
        private List<String> tags;
        private String targetAudience;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateProductRequest {
        @NotBlank
        private String name;
        private String description;
        private String shortDescription;
        @NotNull
        private Product.Category category;
        private List<String> subCategories;
        @NotNull @Min(0)
        private BigDecimal price;
        private BigDecimal discountPrice;
        private Integer discountPercent;
        private Integer gstPercent;
        @NotNull @Min(0)
        private Integer stockQuantity;
        private Integer lowStockThreshold;
        private List<String> images;
        private String mainImage;
        private List<String> colors;
        private List<String> sizes;
        private Map<String, String> specifications;
        private List<String> tags;
        private String targetAudience;
        private boolean featured;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateStockRequest {
        @NotNull @Min(0)
        private Integer stockQuantity;
        private Integer lowStockThreshold;
    }
}

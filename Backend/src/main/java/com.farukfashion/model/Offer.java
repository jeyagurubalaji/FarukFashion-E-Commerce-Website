package com.farukfashion.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "offers")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Offer {

    @Id
    private String id;

    private String title;
    private String description;
    private String bannerImageUrl;
    private String bannerMobileImageUrl;

    private OfferType type;                 // PERCENTAGE, FLAT, BUY_X_GET_Y, FREE_SHIPPING
    private BigDecimal value;               // 10 for 10% or ₹10

    private List<String> applicableCategories;
    private List<String> applicableProductIds;
    private BigDecimal minOrderValue;

    private String couponCode;              // optional
    private Integer maxUsage;
    private Integer usedCount;

    private LocalDateTime startDate;
    private LocalDateTime endDate;

    private boolean active;
    private Integer displayOrder;           // for banner priority
    private boolean showOnHomeBanner;

    public enum OfferType {
        PERCENTAGE, FLAT, BUY_X_GET_Y, FREE_SHIPPING
    }
}

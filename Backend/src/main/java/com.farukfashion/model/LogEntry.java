package com.farukfashion.model;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Separate collections conceptually via type field:
 * - LOGIN_LOG
 * - PURCHASE_LOG
 * - RETURN_REFUND_LOG
 */
@Document(collection = "logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LogEntry {

    @Id
    private String id;

    private LogType type;

    private String userId;
    private String userEmail;
    private String userPhone;

    private String action;                  // LOGIN_SUCCESS, ORDER_PLACED, RETURN_INITIATED, etc.
    private String description;

    private String ipAddress;
    private String userAgent;
    private String deviceInfo;

    // For purchase / return related
    private String orderId;
    private String orderNumber;
    private String productId;
    private Double amount;

    private Map<String, Object> metadata;   // extra flexible data

    private boolean success;

    @CreatedDate
    private LocalDateTime timestamp;

    public enum LogType {
        LOGIN_LOG,
        PURCHASE_LOG,
        RETURN_REFUND_LOG,
        INVENTORY_LOG,
        SYSTEM_LOG
    }
}

package com.farukfashion.model;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "orders")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Order {

    @Id
    private String id;

    private String orderNumber;             // FF-2026-XXXXXX

    private String userId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;

    private List<OrderItem> items;

    private BigDecimal subtotal;
    private BigDecimal discountAmount;
    private BigDecimal shippingCharges;
    private BigDecimal taxAmount;
    private BigDecimal totalAmount;

    private Address shippingAddress;
    private Address billingAddress;

    private OrderStatus status;
    private PaymentStatus paymentStatus;
    private String paymentMethod;           // Razorpay, COD, etc.
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private String razorpaySignature;

    private String trackingNumber;
    private String courierName;

    private String notes;
    private String cancellationReason;
    private String returnReason;
    private RefundStatus refundStatus;
    private BigDecimal refundAmount;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    private LocalDateTime paidAt;
    private LocalDateTime shippedAt;
    private LocalDateTime deliveredAt;
    private LocalDateTime cancelledAt;
    private LocalDateTime returnedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItem {
        private String productId;
        private String productName;
        private String productImage;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal totalPrice;
        private String color;
        private String size;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Address {
        private String fullName;
        private String phone;
        private String addressLine1;
        private String addressLine2;
        private String city;
        private String state;
        private String pincode;
        private String landmark;
    }

    public enum OrderStatus {
        PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED, RETURN_REQUESTED, RETURNED
    }

    public enum PaymentStatus {
        PENDING, PAID, FAILED, REFUNDED, PARTIALLY_REFUNDED
    }

    public enum RefundStatus {
        NONE, REQUESTED, PROCESSING, COMPLETED, REJECTED
    }
}

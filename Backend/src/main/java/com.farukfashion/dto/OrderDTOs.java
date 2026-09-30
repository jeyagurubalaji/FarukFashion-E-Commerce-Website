package com.farukfashion.dto;

import com.farukfashion.model.Order;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

public class OrderDTOs {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateOrderRequest {
        @NotEmpty
        @Valid
        private List<CartItem> items;

        @NotNull @Valid
        private Order.Address shippingAddress;

        private Order.Address billingAddress;
        private String paymentMethod;       // RAZORPAY or COD
        private String couponCode;
        private String notes;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CartItem {
        @NotBlank
        private String productId;
        @Min(1)
        private Integer quantity;
        private String color;
        private String size;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderResponse {
        private String id;
        private String orderNumber;
        private List<Order.OrderItem> items;
        private BigDecimal subtotal;
        private BigDecimal discountAmount;
        private BigDecimal shippingCharges;
        private BigDecimal totalAmount;
        private Order.OrderStatus status;
        private Order.PaymentStatus paymentStatus;
        private String paymentMethod;
        private String razorpayOrderId;
        private Order.Address shippingAddress;
        private String trackingNumber;
        private String createdAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentVerifyRequest {
        @NotBlank
        private String orderId;
        @NotBlank
        private String razorpayOrderId;
        @NotBlank
        private String razorpayPaymentId;
        @NotBlank
        private String razorpaySignature;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReturnRequest {
        @NotBlank
        private String orderId;
        @NotBlank
        private String reason;
        private String comments;
    }
}

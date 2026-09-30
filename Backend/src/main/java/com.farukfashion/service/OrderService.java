package com.farukfashion.service;

import com.farukfashion.dto.OrderDTOs.*;
import com.farukfashion.model.Order;
import com.farukfashion.model.Product;
import com.farukfashion.model.User;
import com.farukfashion.repository.OrderRepository;
import com.farukfashion.repository.ProductRepository;
import com.farukfashion.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.atomic.AtomicLong;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ProductService productService;
    private final PaymentService paymentService;
    private final NotificationService notificationService;
    private final LogService logService;

    private static final AtomicLong orderCounter = new AtomicLong(1000);

    @Transactional
    public Map<String, Object> createOrder(String userId, CreateOrderRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Order.OrderItem> items = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;

        for (CartItem ci : req.getItems()) {
            Product product = productRepository.findById(ci.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found: " + ci.getProductId()));

            if (!product.isInStock() || product.getStockQuantity() < ci.getQuantity()) {
                throw new RuntimeException("Insufficient stock for: " + product.getName());
            }

            BigDecimal unitPrice = product.getDiscountPrice() != null
                    ? product.getDiscountPrice() : product.getPrice();
            BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(ci.getQuantity()));

            items.add(Order.OrderItem.builder()
                    .productId(product.getId())
                    .productName(product.getName())
                    .productImage(product.getMainImage())
                    .quantity(ci.getQuantity())
                    .unitPrice(unitPrice)
                    .totalPrice(lineTotal)
                    .color(ci.getColor())
                    .size(ci.getSize())
                    .build());

            subtotal = subtotal.add(lineTotal);
        }

        BigDecimal shipping = subtotal.compareTo(BigDecimal.valueOf(999)) >= 0
                ? BigDecimal.ZERO : BigDecimal.valueOf(49);
        BigDecimal discount = BigDecimal.ZERO; // coupon logic can be added
        BigDecimal total = subtotal.add(shipping).subtract(discount);

        String orderNumber = generateOrderNumber();

        Order order = Order.builder()
                .orderNumber(orderNumber)
                .userId(userId)
                .customerName(user.getFullName())
                .customerEmail(user.getEmail())
                .customerPhone(user.getPhone())
                .items(items)
                .subtotal(subtotal)
                .discountAmount(discount)
                .shippingCharges(shipping)
                .taxAmount(BigDecimal.ZERO)
                .totalAmount(total)
                .shippingAddress(req.getShippingAddress())
                .billingAddress(req.getBillingAddress() != null ? req.getBillingAddress() : req.getShippingAddress())
                .status(Order.OrderStatus.PENDING)
                .paymentStatus(Order.PaymentStatus.PENDING)
                .paymentMethod(req.getPaymentMethod() != null ? req.getPaymentMethod() : "RAZORPAY")
                .notes(req.getNotes())
                .refundStatus(Order.RefundStatus.NONE)
                .build();

        order = orderRepository.save(order);

        Map<String, Object> response = new HashMap<>();
        response.put("orderId", order.getId());
        response.put("orderNumber", order.getOrderNumber());
        response.put("totalAmount", order.getTotalAmount());

        if ("RAZORPAY".equalsIgnoreCase(order.getPaymentMethod()) || "ONLINE".equalsIgnoreCase(order.getPaymentMethod())) {
            Map<String, String> rzp = paymentService.createRazorpayOrder(total, orderNumber);
            order.setRazorpayOrderId(rzp.get("razorpayOrderId"));
            orderRepository.save(order);
            response.putAll(rzp);
        } else {
            // COD
            confirmOrder(order, user);
            response.put("paymentMethod", "COD");
            response.put("message", "Order placed successfully with Cash on Delivery");
        }

        return response;
    }

    @Transactional
    public OrderResponse verifyAndConfirmPayment(PaymentVerifyRequest req) {
        Order order = orderRepository.findById(req.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found"));

        boolean valid = paymentService.verifyPayment(
                req.getRazorpayOrderId(), req.getRazorpayPaymentId(), req.getRazorpaySignature());

        if (!valid) {
            order.setPaymentStatus(Order.PaymentStatus.FAILED);
            orderRepository.save(order);
            throw new RuntimeException("Payment verification failed");
        }

        order.setRazorpayPaymentId(req.getRazorpayPaymentId());
        order.setRazorpaySignature(req.getRazorpaySignature());
        order.setPaymentStatus(Order.PaymentStatus.PAID);
        order.setPaidAt(LocalDateTime.now());

        User user = userRepository.findById(order.getUserId()).orElse(null);
        confirmOrder(order, user);

        return toResponse(order);
    }

    private void confirmOrder(Order order, User user) {
        // Reduce stock
        for (Order.OrderItem item : order.getItems()) {
            productService.reduceStock(item.getProductId(), item.getQuantity());
        }

        order.setStatus(Order.OrderStatus.CONFIRMED);
        orderRepository.save(order);

        // Logs
        logService.logPurchase(order.getUserId(), order.getCustomerEmail(),
                order.getId(), order.getOrderNumber(),
                order.getTotalAmount().doubleValue(),
                "ORDER_PLACED",
                Map.of("items", order.getItems().size(), "payment", order.getPaymentMethod()));

        // Notifications to buyer + seller (WhatsApp, SMS, Email)
        if (user != null) {
            notificationService.sendOrderConfirmation(order, user);
        }
    }

    public OrderResponse requestReturn(String userId, ReturnRequest req) {
        Order order = orderRepository.findById(req.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        if (order.getStatus() != Order.OrderStatus.DELIVERED) {
            throw new RuntimeException("Only delivered orders can be returned");
        }

        order.setStatus(Order.OrderStatus.RETURN_REQUESTED);
        order.setReturnReason(req.getReason());
        order.setRefundStatus(Order.RefundStatus.REQUESTED);
        order.setReturnedAt(LocalDateTime.now());
        orderRepository.save(order);

        logService.logReturnRefund(userId, order.getCustomerEmail(),
                order.getId(), order.getOrderNumber(),
                order.getTotalAmount().doubleValue(),
                "RETURN_REQUESTED", req.getReason());

        notificationService.sendReturnConfirmation(order);

        return toResponse(order);
    }

    public Page<OrderResponse> getUserOrders(String userId, Pageable pageable) {
        return orderRepository.findByUserId(userId, pageable).map(this::toResponse);
    }

    public OrderResponse getOrder(String orderId) {
        return toResponse(orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found")));
    }

    public OrderResponse updateStatus(String orderId, Order.OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(status);
        if (status == Order.OrderStatus.SHIPPED) order.setShippedAt(LocalDateTime.now());
        if (status == Order.OrderStatus.DELIVERED) order.setDeliveredAt(LocalDateTime.now());
        if (status == Order.OrderStatus.CANCELLED) order.setCancelledAt(LocalDateTime.now());
        orderRepository.save(order);

        notificationService.sendOrderStatusUpdate(order, "Status updated to " + status.name());
        return toResponse(order);
    }

    private String generateOrderNumber() {
        String date = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        return "FF-" + date + "-" + orderCounter.incrementAndGet();
    }

    private OrderResponse toResponse(Order o) {
        return OrderResponse.builder()
                .id(o.getId())
                .orderNumber(o.getOrderNumber())
                .items(o.getItems())
                .subtotal(o.getSubtotal())
                .discountAmount(o.getDiscountAmount())
                .shippingCharges(o.getShippingCharges())
                .totalAmount(o.getTotalAmount())
                .status(o.getStatus())
                .paymentStatus(o.getPaymentStatus())
                .paymentMethod(o.getPaymentMethod())
                .razorpayOrderId(o.getRazorpayOrderId())
                .shippingAddress(o.getShippingAddress())
                .trackingNumber(o.getTrackingNumber())
                .createdAt(o.getCreatedAt() != null ? o.getCreatedAt().toString() : null)
                .build();
    }
}

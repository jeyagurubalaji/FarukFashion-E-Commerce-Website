package com.farukfashion.controller;

import com.farukfashion.dto.OrderDTOs.*;
import com.farukfashion.model.Order;
import com.farukfashion.model.User;
import com.farukfashion.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(@AuthenticationPrincipal User user,
                                                      @Valid @RequestBody CreateOrderRequest request) {
        return ResponseEntity.ok(orderService.createOrder(user.getId(), request));
    }

    @PostMapping("/verify-payment")
    public ResponseEntity<OrderResponse> verifyPayment(@Valid @RequestBody PaymentVerifyRequest request) {
        return ResponseEntity.ok(orderService.verifyAndConfirmPayment(request));
    }

    @GetMapping("/my")
    public ResponseEntity<Page<OrderResponse>> myOrders(@AuthenticationPrincipal User user,
                                                        @RequestParam(defaultValue = "0") int page,
                                                        @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(orderService.getUserOrders(user.getId(), PageRequest.of(page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> get(@PathVariable String id) {
        return ResponseEntity.ok(orderService.getOrder(id));
    }

    @PostMapping("/return")
    public ResponseEntity<OrderResponse> requestReturn(@AuthenticationPrincipal User user,
                                                       @Valid @RequestBody ReturnRequest request) {
        return ResponseEntity.ok(orderService.requestReturn(user.getId(), request));
    }

    @PutMapping("/admin/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrderResponse> updateStatus(@PathVariable String id,
                                                      @RequestParam Order.OrderStatus status) {
        return ResponseEntity.ok(orderService.updateStatus(id, status));
    }
}

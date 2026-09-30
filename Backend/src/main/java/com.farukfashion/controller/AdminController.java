package com.farukfashion.controller;

import com.farukfashion.model.LogEntry;
import com.farukfashion.model.Order;
import com.farukfashion.model.Product;
import com.farukfashion.model.User;
import com.farukfashion.repository.LogEntryRepository;
import com.farukfashion.repository.OrderRepository;
import com.farukfashion.repository.ProductRepository;
import com.farukfashion.repository.UserRepository;
import com.farukfashion.service.LogService;
import com.farukfashion.service.OrderService;
import com.farukfashion.service.ProductService;
import com.farukfashion.model.Offer;
import com.farukfashion.repository.OfferRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final LogEntryRepository logEntryRepository;
    private final ProductService productService;
    private final OrderService orderService;
    private final LogService logService;
    private final OfferRepository offerRepository;

    /** Dashboard summary stats */
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> dashboard() {
        Map<String, Object> stats = new HashMap<>();

        long totalProducts = productRepository.count();
        long activeProducts = productRepository.findByActiveTrue(PageRequest.of(0, 1)).getTotalElements();
        long totalOrders = orderRepository.count();
        long pendingOrders = orderRepository.countByStatus(Order.OrderStatus.PENDING)
                + orderRepository.countByStatus(Order.OrderStatus.CONFIRMED);
        long totalCustomers = userRepository.count();

        List<Product> lowStock = productService.getLowStockProducts();

        // Simple revenue from paid orders
        BigDecimal revenue = orderRepository.findAll().stream()
                .filter(o -> o.getPaymentStatus() == Order.PaymentStatus.PAID)
                .map(Order::getTotalAmount)
                .filter(a -> a != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        stats.put("totalProducts", totalProducts);
        stats.put("activeProducts", activeProducts);
        stats.put("totalOrders", totalOrders);
        stats.put("pendingOrders", pendingOrders);
        stats.put("totalCustomers", totalCustomers);
        stats.put("lowStockCount", lowStock.size());
        stats.put("lowStockProducts", lowStock.stream().limit(10).toList());
        stats.put("totalRevenue", revenue);
        stats.put("recentOrders", orderRepository.findAll(
                PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "createdAt"))).getContent());

        return ResponseEntity.ok(stats);
    }

    /** All products (including inactive) for admin */
    @GetMapping("/products")
    public ResponseEntity<Page<Product>> allProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(
                productRepository.findAll(PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")))
        );
    }

    /** Update full product */
    @PutMapping("/products/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable String id, @RequestBody Product updates) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (updates.getName() != null) product.setName(updates.getName());
        if (updates.getDescription() != null) product.setDescription(updates.getDescription());
        if (updates.getShortDescription() != null) product.setShortDescription(updates.getShortDescription());
        if (updates.getCategory() != null) product.setCategory(updates.getCategory());
        if (updates.getPrice() != null) product.setPrice(updates.getPrice());
        if (updates.getDiscountPrice() != null) product.setDiscountPrice(updates.getDiscountPrice());
        if (updates.getDiscountPercent() != null) product.setDiscountPercent(updates.getDiscountPercent());
        if (updates.getGstPercent() != null) product.setGstPercent(updates.getGstPercent());
        if (updates.getStockQuantity() != null) {
            product.setStockQuantity(updates.getStockQuantity());
            product.updateStockStatus();
        }
        if (updates.getLowStockThreshold() != null) product.setLowStockThreshold(updates.getLowStockThreshold());
        if (updates.getImages() != null) product.setImages(updates.getImages());
        if (updates.getMainImage() != null) product.setMainImage(updates.getMainImage());
        if (updates.getColors() != null) product.setColors(updates.getColors());
        if (updates.getSizes() != null) product.setSizes(updates.getSizes());
        if (updates.getSpecifications() != null) product.setSpecifications(updates.getSpecifications());
        if (updates.getTags() != null) product.setTags(updates.getTags());
        if (updates.getTargetAudience() != null) product.setTargetAudience(updates.getTargetAudience());
        product.setFeatured(updates.isFeatured());
        product.setActive(updates.isActive());

        return ResponseEntity.ok(productRepository.save(product));
    }

    /** Permanently delete product from database */
    @DeleteMapping("/products/{id}")
    public ResponseEntity<Map<String, String>> deleteProduct(@PathVariable String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found: " + id));
        productRepository.delete(product);
        if (productRepository.existsById(id)) {
            productRepository.deleteById(id);
        }
        return ResponseEntity.ok(Map.of(
                "message", "Product deleted permanently",
                "deletedId", id,
                "name", product.getName() != null ? product.getName() : ""
        ));
    }

    /** Same permanent delete via POST (more reliable in browsers) */
    @PostMapping("/products/{id}/delete")
    public ResponseEntity<Map<String, String>> deleteProductPost(@PathVariable String id) {
        return deleteProduct(id);
    }

    /** All orders for admin */
    @GetMapping("/orders")
    public ResponseEntity<Page<Order>> allOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Order.OrderStatus status) {
        if (status != null) {
            // simple filter - for production use custom query
            List<Order> filtered = orderRepository.findByStatus(status);
            int start = page * size;
            int end = Math.min(start + size, filtered.size());
            List<Order> slice = start < filtered.size() ? filtered.subList(start, end) : List.of();
            return ResponseEntity.ok(new org.springframework.data.domain.PageImpl<>(
                    slice, PageRequest.of(page, size), filtered.size()));
        }
        return ResponseEntity.ok(
                orderRepository.findAll(PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")))
        );
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable String id,
            @RequestParam Order.OrderStatus status) {
        return ResponseEntity.ok(orderService.updateStatus(id, status));
    }

    @GetMapping("/customers")
    public ResponseEntity<Page<User>> customers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(userRepository.findAll(PageRequest.of(page, size)));
    }
    @PutMapping("/orders/{id}")
    public ResponseEntity<Order> updateOrder(@PathVariable String id, @RequestBody Order updates) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        if (updates.getStatus() != null) order.setStatus(updates.getStatus());
        if (updates.getPaymentStatus() != null) order.setPaymentStatus(updates.getPaymentStatus());
        if (updates.getNotes() != null) order.setNotes(updates.getNotes());
        if (updates.getTrackingNumber() != null) order.setTrackingNumber(updates.getTrackingNumber());
        if (updates.getCourierName() != null) order.setCourierName(updates.getCourierName());
        return ResponseEntity.ok(orderRepository.save(order));
    }

    @DeleteMapping("/orders/{id}")
    public ResponseEntity<Map<String, String>> deleteOrder(@PathVariable String id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        orderRepository.delete(order);
        return ResponseEntity.ok(Map.of("message", "Order deleted permanently"));
    }

    @PostMapping("/orders/{id}/delete")
    public ResponseEntity<Map<String, String>> deleteOrderPost(@PathVariable String id) {
        return deleteOrder(id);
    }

    @PutMapping("/customers/{id}")
    public ResponseEntity<User> updateCustomer(@PathVariable String id, @RequestBody User updates) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        if (updates.getFirstName() != null) user.setFirstName(updates.getFirstName());
        if (updates.getLastName() != null) user.setLastName(updates.getLastName());
        if (updates.getPhone() != null) user.setPhone(updates.getPhone());
        if (updates.getCity() != null) user.setCity(updates.getCity());
        if (updates.getAddress() != null) user.setAddress(updates.getAddress());
        if (updates.getState() != null) user.setState(updates.getState());
        if (updates.getPincode() != null) user.setPincode(updates.getPincode());
        return ResponseEntity.ok(userRepository.save(user));
    }

    @DeleteMapping("/customers/{id}")
    public ResponseEntity<Map<String, String>> deleteCustomer(@PathVariable String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        userRepository.delete(user);
        return ResponseEntity.ok(Map.of("message", "Customer deleted permanently"));
    }

    @PostMapping("/customers/{id}/delete")
    public ResponseEntity<Map<String, String>> deleteCustomerPost(@PathVariable String id) {
        return deleteCustomer(id);
    }
    // —— Offers (gold banner history) ——
    @GetMapping("/offers")
    public ResponseEntity<List<Offer>> allOffers() {
        return ResponseEntity.ok(offerRepository.findAll());
    }

    @PostMapping("/offers")
    public ResponseEntity<Offer> createOffer(@RequestBody Offer offer) {
        if (offer.getStartDate() == null) {
            offer.setStartDate(java.time.LocalDateTime.now());
        }
        if (offer.getEndDate() == null) {
            offer.setEndDate(java.time.LocalDateTime.now().plusDays(30));
        }
        if (offer.getDisplayOrder() == null) offer.setDisplayOrder(0);
        return ResponseEntity.ok(offerRepository.save(offer));
    }

    @PutMapping("/offers/{id}")
    public ResponseEntity<Offer> updateOffer(@PathVariable String id, @RequestBody Offer updates) {
        Offer offer = offerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Offer not found"));
        if (updates.getTitle() != null) offer.setTitle(updates.getTitle());
        if (updates.getDescription() != null) offer.setDescription(updates.getDescription());
        if (updates.getType() != null) offer.setType(updates.getType());
        if (updates.getValue() != null) offer.setValue(updates.getValue());
        if (updates.getMinOrderValue() != null) offer.setMinOrderValue(updates.getMinOrderValue());
        if (updates.getStartDate() != null) offer.setStartDate(updates.getStartDate());
        if (updates.getEndDate() != null) offer.setEndDate(updates.getEndDate());
        if (updates.getDisplayOrder() != null) offer.setDisplayOrder(updates.getDisplayOrder());
        offer.setActive(updates.isActive());
        offer.setShowOnHomeBanner(updates.isShowOnHomeBanner());
        return ResponseEntity.ok(offerRepository.save(offer));
    }

    @DeleteMapping("/offers/{id}")
    public ResponseEntity<Map<String, String>> deleteOffer(@PathVariable String id) {
        Offer offer = offerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Offer not found"));
        offerRepository.delete(offer);
        return ResponseEntity.ok(Map.of(
                "message", "Offer deleted permanently",
                "title", offer.getTitle() != null ? offer.getTitle() : ""
        ));
    }

    @PostMapping("/offers/{id}/delete")
    public ResponseEntity<Map<String, String>> deleteOfferPost(@PathVariable String id) {
        return deleteOffer(id);
    }
}

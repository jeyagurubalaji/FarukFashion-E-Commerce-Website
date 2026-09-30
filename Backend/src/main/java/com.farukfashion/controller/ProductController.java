package com.farukfashion.controller;

import com.farukfashion.dto.ProductDTOs.*;
import com.farukfashion.model.Product;
import com.farukfashion.model.User;
import com.farukfashion.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping("/products")
    public ResponseEntity<Page<ProductResponse>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        Sort sort = direction.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        return ResponseEntity.ok(productService.getAll(PageRequest.of(page, size, sort)));
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<ProductResponse> getById(@PathVariable String id) {
        return ResponseEntity.ok(productService.getById(id));
    }

    @GetMapping("/products/category/{category}")
    public ResponseEntity<Page<ProductResponse>> byCategory(
            @PathVariable Product.Category category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        return ResponseEntity.ok(productService.getByCategory(category, PageRequest.of(page, size)));
    }

    @GetMapping("/products/search")
    public ResponseEntity<Page<ProductResponse>> search(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        return ResponseEntity.ok(productService.search(q, PageRequest.of(page, size)));
    }

    @GetMapping("/products/featured")
    public ResponseEntity<Page<ProductResponse>> featured(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "8") int size) {
        return ResponseEntity.ok(productService.getFeatured(PageRequest.of(page, size)));
    }

    @GetMapping("/products/recommendations")
    public ResponseEntity<List<ProductResponse>> recommendations(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(productService.getRecommendations(user.getId()));
    }

    @GetMapping("/categories")
    public ResponseEntity<List<Map<String, String>>> categories() {
        List<Map<String, String>> cats = Arrays.stream(Product.Category.values())
                .map(c -> Map.of(
                        "value", c.name(),
                        "label", c.name().replace("_", " ")
                )).toList();
        return ResponseEntity.ok(cats);
    }

    // Admin endpoints
    @PostMapping("/admin/products")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductResponse> create(@Valid @RequestBody CreateProductRequest request) {
        return ResponseEntity.ok(productService.create(request));
    }

    @PutMapping("/admin/products/{id}/stock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductResponse> updateStock(@PathVariable String id,
                                                       @Valid @RequestBody UpdateStockRequest request) {
        return ResponseEntity.ok(productService.updateStock(id, request));
    }

    @GetMapping("/admin/products/low-stock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Product>> lowStock() {
        return ResponseEntity.ok(productService.getLowStockProducts());
    }
}

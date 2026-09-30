package com.farukfashion.service;

import com.farukfashion.dto.ProductDTOs.*;
import com.farukfashion.model.Product;
import com.farukfashion.model.User;
import com.farukfashion.repository.ProductRepository;
import com.farukfashion.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final LogService logService;

    public ProductResponse create(CreateProductRequest req) {
        Product product = Product.builder()
                .name(req.getName())
                .description(req.getDescription())
                .shortDescription(req.getShortDescription())
                .category(req.getCategory())
                .subCategories(req.getSubCategories())
                .price(req.getPrice())
                .discountPrice(req.getDiscountPrice())
                .discountPercent(req.getDiscountPercent())
                .gstPercent(req.getGstPercent() != null ? req.getGstPercent() : 18)
                .stockQuantity(req.getStockQuantity())
                .lowStockThreshold(req.getLowStockThreshold() != null ? req.getLowStockThreshold() : 5)
                .images(req.getImages())
                .mainImage(req.getMainImage())
                .colors(req.getColors())
                .sizes(req.getSizes())
                .specifications(req.getSpecifications())
                .brand("Faruk Fashion")
                .tags(req.getTags())
                .targetAudience(req.getTargetAudience())
                .featured(req.isFeatured())
                .active(true)
                .rating(0.0)
                .reviewCount(0)
                .build();
        product.updateStockStatus();
        product = productRepository.save(product);

        logService.logInventory(product.getId(), "PRODUCT_CREATED",
                "New product added: " + product.getName(),
                Map.of("stock", product.getStockQuantity()));

        return toResponse(product);
    }

    public ProductResponse updateStock(String productId, UpdateStockRequest req) {
        Product product = getProductEntity(productId);
        int oldStock = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
        product.setStockQuantity(req.getStockQuantity());
        if (req.getLowStockThreshold() != null) {
            product.setLowStockThreshold(req.getLowStockThreshold());
        }
        product.updateStockStatus();
        product = productRepository.save(product);

        logService.logInventory(productId, "STOCK_UPDATED",
                "Stock changed from " + oldStock + " to " + req.getStockQuantity(),
                Map.of("oldStock", oldStock, "newStock", req.getStockQuantity()));

        return toResponse(product);
    }

    public void reduceStock(String productId, int quantity) {
        Product product = getProductEntity(productId);
        if (product.getStockQuantity() < quantity) {
            throw new RuntimeException("Insufficient stock for: " + product.getName());
        }
        product.setStockQuantity(product.getStockQuantity() - quantity);
        product.updateStockStatus();
        productRepository.save(product);

        logService.logInventory(productId, "STOCK_REDUCED",
                "Reduced by " + quantity + ". Remaining: " + product.getStockQuantity(),
                Map.of("reducedBy", quantity, "remaining", product.getStockQuantity()));
    }

    public Page<ProductResponse> getAll(Pageable pageable) {
        return productRepository.findByActiveTrue(pageable).map(this::toResponse);
    }

    public Page<ProductResponse> getByCategory(Product.Category category, Pageable pageable) {
        return productRepository.findByCategoryAndActiveTrue(category, pageable).map(this::toResponse);
    }

    public Page<ProductResponse> search(String keyword, Pageable pageable) {
        return productRepository.search(keyword, pageable).map(this::toResponse);
    }

    public ProductResponse getById(String id) {
        return toResponse(getProductEntity(id));
    }

    public Page<ProductResponse> getFeatured(Pageable pageable) {
        return productRepository.findByFeaturedTrueAndActiveTrue(pageable).map(this::toResponse);
    }

    /**
     * Personalized recommendations based on user preferences
     */
    public List<ProductResponse> getRecommendations(String userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null || user.getPreferredCategories() == null || user.getPreferredCategories().isEmpty()) {
            return productRepository.findByFeaturedTrueAndActiveTrue(
                    org.springframework.data.domain.PageRequest.of(0, 8)
            ).map(this::toResponse).getContent();
        }

        List<Product.Category> cats = user.getPreferredCategories().stream()
                .map(c -> {
                    try { return Product.Category.valueOf(c.toUpperCase().replace(" ", "_")); }
                    catch (Exception e) { return null; }
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        List<String> tags = new ArrayList<>();
        if (user.getPreferredStyle() != null) tags.add(user.getPreferredStyle().toLowerCase());
        if (user.getPreferredColors() != null) tags.addAll(user.getPreferredColors());

        List<Product> recommended = productRepository.findRecommended(cats, tags);
        if (recommended.isEmpty()) {
            return productRepository.findByCategoryAndActiveTrue(
                    cats.get(0), org.springframework.data.domain.PageRequest.of(0, 8)
            ).map(this::toResponse).getContent();
        }
        return recommended.stream().limit(8).map(this::toResponse).collect(Collectors.toList());
    }

    public List<Product> getLowStockProducts() {
        return productRepository.findByStockQuantityLessThanEqualAndActiveTrue(10);
    }

    private Product getProductEntity(String id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found: " + id));
    }

    private ProductResponse toResponse(Product p) {
        return ProductResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .description(p.getDescription())
                .shortDescription(p.getShortDescription())
                .category(p.getCategory())
                .subCategories(p.getSubCategories())
                .price(p.getPrice())
                .discountPrice(p.getDiscountPrice())
                .discountPercent(p.getDiscountPercent())
                .gstPercent(p.getGstPercent())
                .stockQuantity(p.getStockQuantity())
                .inStock(p.isInStock())
                .images(p.getImages())
                .mainImage(p.getMainImage())
                .colors(p.getColors())
                .sizes(p.getSizes())
                .specifications(p.getSpecifications())
                .brand(p.getBrand())
                .rating(p.getRating())
                .reviewCount(p.getReviewCount())
                .featured(p.isFeatured())
                .tags(p.getTags())
                .targetAudience(p.getTargetAudience())
                .build();
    }
}

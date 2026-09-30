package com.farukfashion.config;

import com.farukfashion.model.Offer;
import com.farukfashion.model.Product;
import com.farukfashion.model.User;
import com.farukfashion.repository.OfferRepository;
import com.farukfashion.repository.ProductRepository;
import com.farukfashion.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OfferRepository offerRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (productRepository.count() == 0) {
            seedProducts();
            log.info("Sample products seeded");
        }
        if (userRepository.findByEmail("admin@farukfashion.com").isEmpty()) {
            seedAdmin();
            log.info("Admin user created: admin@farukfashion.com / admin123");
        }
        if (offerRepository.count() == 0) {
            seedOffers();
            log.info("Sample offers seeded");
        }
    }

    private void seedAdmin() {
        User admin = User.builder()
                .email("admin@farukfashion.com")
                .phone("9344282751")
                .password(passwordEncoder.encode("admin123"))
                .firstName("Faruk")
                .lastName("Admin")
                .roles(Set.of(User.Role.ADMIN))
                .active(true)
                .build();
        userRepository.save(admin);
    }

    private void seedOffers() {
        offerRepository.save(Offer.builder()
                .title("")
                .description("")
                .type(Offer.OfferType.PERCENTAGE)
                .value(BigDecimal.valueOf(15))
                .startDate(LocalDateTime.now().minusDays(1))
                .endDate(LocalDateTime.now().plusMonths(1))
                .active(true)
                .showOnHomeBanner(true)
                .displayOrder(1)
                .build());
        offerRepository.save(Offer.builder()
                .title("")
                .description("")
                .type(Offer.OfferType.FREE_SHIPPING)
                .value(BigDecimal.valueOf(999))
                .startDate(LocalDateTime.now().minusDays(1))
                .endDate(LocalDateTime.now().plusMonths(3))
                .active(true)
                .showOnHomeBanner(true)
                .displayOrder(2)
                .build());
    }

    private void seedProducts() {
        List<Product> products = List.of(
            product("Elegant Pink Handbag", Product.Category.HANDBAGS,
                    "Premium quilted handbag with gold accents. Perfect for everyday elegance.",
                    1899, 1599, 15, 25, true,
                    List.of("Pink", "Beige"), List.of("elegant", "women"), "Women"),
            product("Classic Beige Quilted Tote", Product.Category.HANDBAGS,
                    "Spacious quilted tote with chain strap. Classic and timeless.",
                    2199, null, null, 18, true,
                    List.of("Beige", "Cream"), List.of("elegant", "classic"), "Women"),
            product("Mint Green Hard Trolley", Product.Category.TROLLEY_BAGS,
                    "Lightweight hard-shell trolley with 360° wheels. Ideal for travel.",
                    4999, 4299, 14, 12, true,
                    List.of("Mint", "Green"), List.of("travel", "durable"), "Unisex"),
            product("Coral Pink Cabin Trolley", Product.Category.TROLLEY_BAGS,
                    "Compact cabin-size trolley. Stylish and sturdy.",
                    3999, null, null, 10, true,
                    List.of("Coral", "Pink"), List.of("travel"), "Unisex"),
            product("Unicorn Kids School Bag", Product.Category.SCHOOL_BAGS,
                    "Adorable unicorn print school backpack with multiple compartments.",
                    899, 749, 17, 40, true,
                    List.of("Pink"), List.of("kids", "school"), "Kids"),
            product("Rocket Purple School Bag", Product.Category.SCHOOL_BAGS,
                    "Fun rocket design school bag. Lightweight and spacious.",
                    849, null, null, 35, true,
                    List.of("Purple", "Blue"), List.of("kids", "school"), "Kids"),
            product("Sky Blue College Backpack", Product.Category.COLLEGE_BAGS,
                    "Modern college backpack with laptop sleeve and USB port.",
                    1299, 1099, 15, 30, true,
                    List.of("Blue", "Sky"), List.of("college", "laptop"), "Unisex"),
            product("Sage Green College Backpack", Product.Category.COLLEGE_BAGS,
                    "Minimalist college bag with premium finish.",
                    1199, null, null, 28, true,
                    List.of("Green", "Sage"), List.of("college"), "Unisex"),
            product("Professional Office Laptop Bag", Product.Category.OFFICE_BAGS,
                    "Sleek office bag with padded laptop compartment.",
                    2499, 2199, 12, 15, true,
                    List.of("Black", "Brown"), List.of("office", "professional"), "Unisex"),
            product("Crossbody Sling Bag", Product.Category.SLING_BAGS,
                    "Compact crossbody sling for daily essentials.",
                    699, 599, 14, 50, false,
                    List.of("Black", "Tan"), List.of("casual", "everyday"), "Unisex"),
            product("Travelling Kit Set", Product.Category.TRAVELLING_KIT,
                    "Complete travel organizer kit with toiletry pouch and packing cubes.",
                    1499, null, null, 20, true,
                    List.of("Grey", "Navy"), List.of("travel"), "Unisex"),
            product("Kids Cartoon Duffle", Product.Category.KIDS_BAGS,
                    "Colourful kids duffle bag for overnight stays and activities.",
                    799, null, null, 22, false,
                    List.of("Multi"), List.of("kids"), "Kids")
        );
        productRepository.saveAll(products);
    }

    private Product product(String name, Product.Category cat, String desc,
                            int price, Integer discount, Integer pct, int stock,
                            boolean featured, List<String> colors, List<String> tags, String audience) {
        Product p = Product.builder()
                .name(name)
                .description(desc)
                .shortDescription(desc.substring(0, Math.min(80, desc.length())))
                .category(cat)
                .price(BigDecimal.valueOf(price))
                .discountPrice(discount != null ? BigDecimal.valueOf(discount) : null)
                .discountPercent(pct)
                .stockQuantity(stock)
                .lowStockThreshold(5)
                .colors(colors)
                .tags(tags)
                .targetAudience(audience)
                .brand("Faruk Fashion")
                .featured(featured)
                .active(true)
                .rating(4.2 + Math.random() * 0.7)
                .reviewCount((int) (10 + Math.random() * 50))
                .specifications(Map.of(
                        "Material", "Premium Synthetic / Fabric",
                        "Brand", "Faruk Fashion",
                        "Warranty", "6 Months"
                ))
                .build();
        p.updateStockStatus();
        return p;
    }
}

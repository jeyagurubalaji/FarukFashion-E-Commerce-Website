package com.farukfashion.repository;

import com.farukfashion.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends MongoRepository<Product, String> {

    Page<Product> findByActiveTrue(Pageable pageable);

    Page<Product> findByCategoryAndActiveTrue(Product.Category category, Pageable pageable);

    Page<Product> findByFeaturedTrueAndActiveTrue(Pageable pageable);

    List<Product> findByStockQuantityLessThanEqualAndActiveTrue(Integer threshold);

    @Query("{ 'active': true, '$or': [ " +
           "{ 'name': { $regex: ?0, $options: 'i' } }, " +
           "{ 'description': { $regex: ?0, $options: 'i' } }, " +
           "{ 'tags': { $regex: ?0, $options: 'i' } } ] }")
    Page<Product> search(String keyword, Pageable pageable);

    @Query("{ 'active': true, 'category': { $in: ?0 }, 'tags': { $in: ?1 } }")
    List<Product> findRecommended(List<Product.Category> categories, List<String> tags);

    List<Product> findByInStockFalseAndActiveTrue();
}

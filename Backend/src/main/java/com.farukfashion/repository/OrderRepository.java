package com.farukfashion.repository;

import com.farukfashion.model.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends MongoRepository<Order, String> {
    Optional<Order> findByOrderNumber(String orderNumber);
    Page<Order> findByUserId(String userId, Pageable pageable);
    List<Order> findByStatus(Order.OrderStatus status);
    long countByStatus(Order.OrderStatus status);
}

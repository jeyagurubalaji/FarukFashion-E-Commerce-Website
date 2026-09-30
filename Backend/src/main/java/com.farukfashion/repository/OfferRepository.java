package com.farukfashion.repository;

import com.farukfashion.model.Offer;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OfferRepository extends MongoRepository<Offer, String> {

    @Query("{ 'active': true, 'showOnHomeBanner': true, 'startDate': { $lte: ?0 }, 'endDate': { $gte: ?0 } }")
    List<Offer> findActiveHomeBanners(LocalDateTime now);

    @Query("{ 'active': true, 'startDate': { $lte: ?0 }, 'endDate': { $gte: ?0 } }")
    List<Offer> findActiveOffers(LocalDateTime now);
}

package com.farukfashion.controller;

import com.farukfashion.model.Offer;
import com.farukfashion.repository.OfferRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/offers")
@RequiredArgsConstructor
public class OfferController {

    private final OfferRepository offerRepository;

    @GetMapping("/banners")
    public ResponseEntity<List<Offer>> homeBanners() {
        return ResponseEntity.ok(offerRepository.findActiveHomeBanners(LocalDateTime.now()));
    }

    @GetMapping
    public ResponseEntity<List<Offer>> activeOffers() {
        return ResponseEntity.ok(offerRepository.findActiveOffers(LocalDateTime.now()));
    }

    @PostMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Offer> create(@RequestBody Offer offer) {
        return ResponseEntity.ok(offerRepository.save(offer));
    }
}

package com.cts.venue_manager.repository;

import com.cts.venue_manager.model.Resource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * JPA Repository for the Resource Entity.
 * @author 2479476
 * @version 1.1
 * @since 27-02-2026
 */
@Repository
public interface ResourceRepository extends JpaRepository<Resource, String> {
    Optional<Resource> findByName(String name);

    boolean existsByNameAndVenue_VenueId(String name, String venueId);

    Resource findByResourceId(String resourceId);

    List<Resource> findByVenue_VenueId(String venueId);
}
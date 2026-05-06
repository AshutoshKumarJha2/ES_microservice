package com.cts.venue_manager.repository;

import com.cts.venue_manager.model.ResourceAllocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;


/**
 * JPA Repository for the ResourceAllocation Entity.
 * * @author 2479476
 *
 * @version 1.0
 * @since 27-02-2026
 */
@Repository
public interface ResourceAllocationRepository extends JpaRepository<ResourceAllocation,String> {

    List<ResourceAllocation> findByEventId(String eventId);

    boolean existsByResource_ResourceIdAndEventId(String resourceId, String eventId);

    List<ResourceAllocation> findByEventIdAndVenue_VenueId(String eventId, String venueId);

    List<ResourceAllocation> findByEventIdInAndVenue_VenueIdIn(List<String> eventIds, List<String> venueIds);
}

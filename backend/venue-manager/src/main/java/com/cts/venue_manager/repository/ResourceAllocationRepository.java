package com.cts.venue_manager.repository;

import com.cts.venue_manager.model.ResourceAllocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceAllocationRepository extends JpaRepository<ResourceAllocation,String> {

    List<ResourceAllocation> findByEvent_EventId(String eventId);

    boolean existsByResourceNameAndEventEventId(String resourceName,String eventId);

    List<ResourceAllocation> findByEvent_EventIdAndVenue_VenueId(String eventId, String venueId);
}

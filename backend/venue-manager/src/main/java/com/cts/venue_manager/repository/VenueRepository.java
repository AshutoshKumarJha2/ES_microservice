package com.cts.venue_manager.repository;

import com.cts.venue_manager.model.Venue;
import com.cts.venue_manager.model.data.AvailabilityStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface VenueRepository extends JpaRepository<Venue, String> {

    Venue findByVenueId(String venueId);

    List<Venue> findByLocation(String location);

    List<Venue> findByCapacityGreaterThanEqual(int capacity);

    List<Venue> findByAvailabilityStatus(AvailabilityStatus status);

    /**
     * Finds venues that are available on a specific date, match the status,
     * and meet the minimum capacity requirement.
     */
    @Query("""
       SELECT v 
       FROM Venue v 
       WHERE v.availabilityStatus = :status
         AND (:minCapacity IS NULL OR v.capacity >= :minCapacity)
         AND NOT EXISTS (
             SELECT e 
             FROM Event e 
             WHERE e.venueId = v.venueId
               AND e.startDate <= :date 
               AND e.endDate >= :date 
         )
    """)
    List<Venue> findAvailableVenues(
            @Param("date") LocalDate date,
            @Param("status") AvailabilityStatus status,
            @Param("minCapacity") Integer minCapacity
    );
}
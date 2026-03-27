package com.cts.venue_manager.repository;

import com.cts.venue_manager.model.Venue;
import com.cts.venue_manager.model.data.AvailabilityStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;


/**
 * JPA Repository for the Venue Entity.
 * * @author 2479476
 *
 * @version 1.0
 * @since 27-02-2026
 */
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
//    @Query("""
//   SELECT v
//   FROM Venue v
//   LEFT JOIN v.events e
//   WHERE v.availabilityStatus = :status
//     AND (:minCapacity IS NULL OR v.capacity >= :minCapacity)
//     AND (e IS NULL OR NOT (:date BETWEEN e.startDate AND e.endDate))
//""")
//    List<Venue> findAvailableVenues(
//            @Param("date") LocalDate date,
//            @Param("status") AvailabilityStatus status,
//            @Param("minCapacity") Integer minCapacity
//    );
}
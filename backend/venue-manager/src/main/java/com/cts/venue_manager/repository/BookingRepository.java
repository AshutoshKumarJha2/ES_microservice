package com.cts.venue_manager.repository;

import com.cts.venue_manager.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * JPA Repository for the Booking Entity.
 * * @author 2479476
 *
 * @version 1.0
 * @since 27-02-2026
 */

@Repository
public interface BookingRepository extends JpaRepository<Booking, String> {
    List<Booking> findByEventId(String eventId);

    List<Booking> findByVenue_VenueId(String venueId);

    List<Booking> findByVenue_VenueIdIn(List<String> venueIds);
}

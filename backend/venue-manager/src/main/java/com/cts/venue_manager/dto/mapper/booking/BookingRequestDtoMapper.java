package com.cts.venue_manager.dto.mapper.booking;

import com.cts.venue_manager.dto.booking.BookingRequestDto;
import com.cts.venue_manager.model.Booking;
import org.springframework.stereotype.Component;

/**
 * Mapper to convert BookingRequestDto to Booking Entity
 *
 * @author 2479476
 * @version 1.0
 * @since 04-03-2026
 */
@Component
public class BookingRequestDtoMapper {

    /**
     * Maps Request DTO to Booking Entity.
     * Note: bookingId, createdAt, and updatedAt are handled by Hibernate/JPA.
     *
     * @param dto the booking request data
     * @return a Booking entity populated with DTO data
     */
    public Booking toEntity(BookingRequestDto dto) {
        Booking booking = new Booking();
        booking.setEventId(dto.eventId());
        // Leave venue out of the mapper entirely
        return booking;
    }
}
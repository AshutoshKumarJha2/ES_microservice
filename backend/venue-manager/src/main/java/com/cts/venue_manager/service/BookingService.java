package com.cts.venue_manager.service;

import com.cts.venue_manager.dto.booking.BookingRequestDto;
import com.cts.venue_manager.dto.booking.BookingResponseDto;
import com.cts.venue_manager.dto.booking.BookingResponseVenueManagerDto;
import com.cts.venue_manager.model.data.BookingStatus;

import java.util.List;

/**
 * Service interface for managing venue booking lifecycles within the EventSphere system.
 * This interface defines the contract for creating, updating, and retrieving booking
 * records, ensuring consistency across venue and event management modules.
 *
 * @author 2479476
 * @version 1.0
 * @since 2026-03-26
 */
public interface BookingService {

    /**
     * Creates a new booking record for a venue.
     * Validates the request data and persists a new booking entity associated with an event.
     *
     * @param actorId the unique identifier of the user performing the creation
     * @param bookingRequestDto the data transfer object containing booking details
     * @return the created booking details as a BookingResponseDto
     */
    BookingResponseDto createBooking(String actorId, BookingRequestDto bookingRequestDto);

    /**
     * Updates the status of an existing booking.
     * Transitions a booking between states such as pending, confirmed, or cancelled.
     *
     * @param actorId the unique identifier of the user performing the status update
     * @param bookingId the unique identifier of the booking to be updated
     * @param status the new status to be applied to the booking
     * @return the updated booking details with the new status
     */
    BookingResponseDto updateBookingStatus(String actorId, String bookingId, BookingStatus status);

    /**
     * Removes a booking record from the system.
     * Performs a hard deletion of the booking identified by the provided ID.
     *
     * @param actorId the unique identifier of the user performing the deletion
     * @param bookingId the unique identifier of the booking to be removed
     */
    void deleteBooking(String actorId, String bookingId);


    List<BookingResponseDto> getBookingByManager(String actorId);

    /**
     * Retrieves all booking records currently in the system.
     * Provides a comprehensive list of all reservations for administrative overview.
     *
     * @param actorId the unique identifier of the user requesting the data
     * @return a list of all bookings as BookingResponseDto objects
     */
    List<BookingResponseDto> getAllBookingsServ(String actorId);

    /**
     * Retrieves all bookings associated with a specific venue.
     * Useful for venue managers to track their site's reservation schedule.
     *
     * @param actorId the unique identifier of the user requesting the data
     * @param venueId the unique identifier of the venue to filter by
     * @return a list of venue-specific bookings for manager view
     */
    List<BookingResponseVenueManagerDto> getBookingsByVenue(String actorId, String venueId);

    /**
     * Retrieves all bookings associated with a specific event.
     * Allows event organizers to track all venue reservations made for a single event.
     *
     * @param actorId the unique identifier of the user requesting the data
     * @param eventId the unique identifier of the event to filter by
     * @return a list of bookings associated with the specified event
     */
    List<BookingResponseDto> getBookingsByEvent(String actorId, String eventId);
}
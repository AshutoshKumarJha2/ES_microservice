package com.cts.venue_manager.controller;

import com.cts.venue_manager.auth.dto.UserPrincipal;
import com.cts.venue_manager.dto.booking.BookingRequestDto;
import com.cts.venue_manager.dto.booking.BookingResponseDto;
import com.cts.venue_manager.dto.booking.BookingResponseVenueManagerDto;
import com.cts.venue_manager.model.data.BookingStatus;
import com.cts.venue_manager.service.BookingService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for managing booking operations within the venue management system.
 * This controller handles the lifecycle of venue reservations, including creation,
 * status transitions, and filtered retrievals, integrated with role-based security.
 *
 * @author 2479476
 * @version 1.0
 * @since 2026-03-26
 */
@RestController
@Slf4j
@RequiredArgsConstructor
@Validated
public class BookingController {

    private final BookingService bookingService;

    /**
     * Initiates a new booking request in the system.
     * Restricted to users with the ORGANIZER role.
     *
     * @param bookingRequestDto the details of the booking to be created
     * @param userPrincipal the authenticated user performing the action
     * @return a ResponseEntity containing the created booking response DTO
     */
    @PostMapping("/bookings")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<BookingResponseDto> createBooking(
            @RequestBody @Valid BookingRequestDto bookingRequestDto,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        String actorId = userPrincipal.userId();
        log.info("REST request to create Booking for event: {} by actor: {}", bookingRequestDto, actorId);
        BookingResponseDto response = bookingService.createBooking(actorId, bookingRequestDto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * Retrieves a high-level overview of all bookings in the system.
     * Restricted to users with the ADMIN role.
     *
     * @param userPrincipal the authenticated user performing the action
     * @return a ResponseEntity containing a list of all booking response DTOs
     */
    @GetMapping("/bookings")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<BookingResponseDto>> getAllBookings(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        String actorId = userPrincipal.userId();
        log.info("REST request to fetch all bookings by actor: {}", actorId);
        return ResponseEntity.ok(bookingService.getAllBookingsServ(actorId));
    }

    /**
     * Retrieves all bookings across all venues managed by the authenticated venue manager.
     *
     * @param userPrincipal the authenticated user performing the action
     * @return a ResponseEntity containing a list of booking response DTOs
     */
    @GetMapping("/bookings/manager")
    @PreAuthorize("hasAnyRole('VENUE_MANAGER', 'ADMIN')")
    public ResponseEntity<List<BookingResponseDto>> getBookingsByManager(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        String actorId = userPrincipal.userId();
        log.info("REST request to fetch bookings for manager: {}", actorId);
        return ResponseEntity.ok(bookingService.getBookingByManager(actorId));
    }

    /**
     * Retrieves all bookings associated with a specific venue.
     * Accessible by VENUE_MANAGER and ADMIN roles.
     *
     * @param venueId the unique identifier of the venue
     * @param userPrincipal the authenticated user performing the action
     * @return a ResponseEntity containing a list of bookings for the specified venue
     */
    @GetMapping("/venues/{venueId}/bookings")
    @PreAuthorize("hasAnyRole('VENUE_MANAGER', 'ADMIN')")
    public ResponseEntity<List<BookingResponseVenueManagerDto>> getBookingsByVenue(
            @PathVariable @NotBlank String venueId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        String actorId = userPrincipal.userId();
        log.info("REST request to fetch bookings for venue ID: {} by actor: {}", venueId, actorId);
        return ResponseEntity.ok(bookingService.getBookingsByVenue(actorId, venueId));
    }

    /**
     * Retrieves bookings associated with a specific event ID.
     * Accessible by ORGANIZER (for their own events) and ADMIN roles.
     *
     * @param eventId the unique identifier of the event
     * @param userPrincipal the authenticated user performing the action
     * @return a ResponseEntity containing a list of bookings for the specified event
     */
    @GetMapping("/bookings/events/{eventId}")
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    public ResponseEntity<List<BookingResponseDto>> getBookingsByEvent(
            @PathVariable @NotBlank String eventId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        String actorId = userPrincipal.userId();
        log.info("REST request to fetch bookings by event ID: {} by actor: {}", eventId, actorId);
        return ResponseEntity.ok(bookingService.getBookingsByEvent(actorId, eventId));
    }

    /**
     * Updates the status of an existing booking.
     * Restricted to VENUE_MANAGER or ADMIN roles to allow accepting or rejecting requests.
     *
     * @param id the unique identifier of the booking to update
     * @param newStatus the new BookingStatus to be applied
     * @param userPrincipal the authenticated user performing the action
     * @return a ResponseEntity containing the updated booking response DTO
     */
    @PatchMapping("/bookings/{bookingId}/status")
    @PreAuthorize("hasAnyRole('VENUE_MANAGER', 'ADMIN')")
    public ResponseEntity<BookingResponseDto> updateStatus(
            @PathVariable("bookingId") @NotBlank String id,
            @RequestParam("newStatus") @NotNull BookingStatus newStatus,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        String actorId = userPrincipal.userId();
        log.info("REST request to update status for Booking ID: {} to {} by actor: {}", id, newStatus, actorId);
        BookingResponseDto updatedBooking = bookingService.updateBookingStatus(actorId, id, newStatus);
        return ResponseEntity.ok(updatedBooking);
    }

    /**
     * Removes a booking record from the system.
     * Restricted to users with the ADMIN role.
     *
     * @param bookingId the unique identifier of the booking to delete
     * @param userPrincipal the authenticated user performing the action
     * @return an empty ResponseEntity with No Content status
     */
    @DeleteMapping("/bookings/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteBooking(
            @PathVariable("id") @NotBlank String bookingId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        String actorId = userPrincipal.userId();
        log.info("REST request to delete booking with ID: {} by actor: {}", bookingId, actorId);
        bookingService.deleteBooking(actorId, bookingId);
        return ResponseEntity.noContent().build();
    }
}
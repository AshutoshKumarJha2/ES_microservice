package com.cts.venue_manager.service.impl;

import com.cts.venue_manager.dto.booking.BookingRequestDto;
import com.cts.venue_manager.dto.booking.BookingResponseDto;
import com.cts.venue_manager.dto.booking.BookingResponseVenueManagerDto;
import com.cts.venue_manager.dto.mapper.booking.BookingRepsonseVenueManagerDtoMapper;
import com.cts.venue_manager.dto.mapper.booking.BookingRequestDtoMapper;
import com.cts.venue_manager.dto.mapper.booking.BookingResponseDtoMapper;
import com.cts.venue_manager.dto.mapper.resource.ResourceVenueManagerDtoMapper;
import com.cts.venue_manager.dto.resource.ResourceVenueManagerResponseDto;
import com.cts.venue_manager.exception.booking.BookingNotFoundException;
import com.cts.venue_manager.exception.venue.VenueNotFoundException;
import com.cts.venue_manager.model.Booking;
import com.cts.venue_manager.model.ResourceAllocation;
import com.cts.venue_manager.model.Venue;
//import com.cts.venue_manager.model.data.AuditAction;
import com.cts.venue_manager.model.data.BookingStatus;
import com.cts.venue_manager.repository.BookingRepository;
import com.cts.venue_manager.repository.ResourceAllocationRepository;
import com.cts.venue_manager.repository.VenueRepository;
//import com.cts.venue_manager.service.AuditService;
import com.cts.venue_manager.service.BookingService;
//import com.cts.venue_manager.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service Implementation for Booking operations.
 * Integrated with Auditing and Notifications for full lifecycle tracking.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final VenueRepository venueRepository;
//    private final AuditService auditService;
//    private final NotificationService notificationService;
    private final BookingRequestDtoMapper requestMapper;
    private final BookingResponseDtoMapper responseMapper;
    private final ResourceAllocationRepository resourceAllocationRepository;
    private final BookingRepsonseVenueManagerDtoMapper venueManagerMapper;

    /**
     * Helper to send notifications without interrupting the primary business transaction.
     */
//    private void sendSafeNotification(String userId, String message, String type) {
//        try {
//            notificationService.sendNotification(userId, message, type);
//        } catch (Exception e) {
//            log.error("Notification failed for user {}: {}", userId, e.getMessage());
//        }
//    }

    @Override
    @Transactional
    public BookingResponseDto createBooking(String actorId, BookingRequestDto dto) {
        Booking booking = requestMapper.toEntity(dto);
        Venue venue = venueRepository.findById(dto.venueId())
                .orElseThrow(() -> new VenueNotFoundException("Venue not found with id: " + dto.venueId()));

        booking.setVenue(venue);
        booking.setDate(booking.getDate() == null ? LocalDate.now() : booking.getDate());
        booking.setStatus(BookingStatus.PENDING);

        Booking saved = bookingRepository.save(booking);

        // Audit and Notify
//        auditService.logAudit(actorId, AuditAction.CREATE, Booking.class, saved.getBookingId());
//        sendSafeNotification(actorId, "Your booking request for venue " + venue.getName() + " is now pending approval.", "BOOKING_CREATED");

        return responseMapper.toDto(saved, new ArrayList<>());
    }

    @Override
    @Transactional
    public BookingResponseDto updateBookingStatus(String actorId, String bookingId, BookingStatus newStatus) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException("Booking not found"));

        booking.setStatus(newStatus);
        Booking saved = bookingRepository.save(booking);

        // Audit and Notify
//        auditService.logAudit(actorId, AuditAction.UPDATE, Booking.class, bookingId);
//        sendSafeNotification(actorId, "Booking status for " + bookingId + " has been updated to: " + newStatus, "BOOKING_STATUS_UPDATE");

        return responseMapper.toDto(saved, new ArrayList<>());
    }

    @Override
    public void deleteBooking(String actorId, String bookingId) {
        if (!bookingRepository.existsById(bookingId)) {
            throw new BookingNotFoundException("Booking not found");
        }

        bookingRepository.deleteById(bookingId);

        // Audit and Notify
//        auditService.logAudit(actorId, AuditAction.DELETE, Booking.class, bookingId);
//        sendSafeNotification(actorId, "Booking " + bookingId + " has been successfully removed from the system.", "BOOKING_DELETED");

        log.info("Booking {} deleted by actor {}", bookingId, actorId);
    }

    // Read methods remain unchanged as they don't typically trigger notifications...
    @Override
    public List<BookingResponseDto> getAllBookingsServ(String actorId) {
        return bookingRepository.findAll().stream()
//                .peek(b -> auditService.logAudit(actorId, AuditAction.READ, Booking.class, b.getBookingId()))
                .map(b -> responseMapper.toDto(b, new ArrayList<>()))
                .toList();
    }

    /**
     * Retrieves all bookings for a specific venue and maps them to DTOs.
     * Fetches associated resource allocations based on the event ID from each booking.
     *
     * @param actorId the ID of the user performing the action
     * @param venueId the unique identifier of the venue
     * @return a list of BookingResponseVenueManagerDto containing booking and resource details
     */
    @Override
    public List<BookingResponseVenueManagerDto> getBookingsByVenue(String actorId, String venueId) {
        return bookingRepository.findByVenue_VenueId(venueId).stream()
                .map(booking -> {
                    String eventId = booking.getEventId();
                    List<ResourceAllocation> allocations = resourceAllocationRepository.findByEventId(eventId);


                    List<ResourceVenueManagerResponseDto> allocationDtos = allocations.stream()
                            .map(ResourceVenueManagerDtoMapper::toDto)
                            .toList();

                    return venueManagerMapper.toDto(booking, allocationDtos);
                })
                .toList();
    }

    @Override
    public List<BookingResponseDto> getBookingsByEvent(String actorId, String eventId) {
        return bookingRepository.findByEventId(eventId).stream()
//                .peek(b -> auditService.logAudit(actorId, AuditAction.READ, Booking.class, b.getBookingId()))
                .map(b -> responseMapper.toDto(b, new ArrayList<>()))
                .toList();
    }
}
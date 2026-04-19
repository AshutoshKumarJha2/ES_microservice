package com.cts.venue_manager.service.impl;

import com.cts.venue_manager.dto.mapper.venue.VenueRequestDtoMapper;
import com.cts.venue_manager.dto.mapper.venue.VenueResponseDtoMapper;
import com.cts.venue_manager.dto.venue.VenueRequestDto;
import com.cts.venue_manager.dto.venue.VenueResponseDto;
import com.cts.venue_manager.exception.venue.VenueNotFoundException;
import com.cts.venue_manager.model.Venue;
//import com.cts.venue_manager.model.data.AuditAction;
import com.cts.venue_manager.model.data.AvailabilityStatus;
import com.cts.venue_manager.repository.VenueRepository;
//import com.cts.venue_manager.service.AuditService;
//import com.cts.venue_manager.service.NotificationService;
import com.cts.venue_manager.service.VenueService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;

/**
 * Service implementation for Venue related operations with integrated Auditing and Notifications.
 * Handles business logic for venue registration, updates, and filtering while maintaining
 * an audit trail and notifying relevant actors.
 *
 * @author 2479476
 * @since 05-03-2026
 * @version 1.1
 */
@Slf4j
@RequiredArgsConstructor
@Service
public class VenueServiceImpl implements VenueService {

    private final VenueRepository venueRepository;
    //    private final AuditService auditService;
//    private final NotificationService notificationService;
    private final VenueRequestDtoMapper venueRequestDtoMapper;
    private final VenueResponseDtoMapper venueResponseDtoMapper;

    /**
     * Helper method to send notifications safely without breaking the main transaction.
     *
     * @param userId  The unique identifier of the user to receive the notification.
     * @param message The content of the notification.
     * @param type    The category/type of notification.
     */
//    private void sendSafeNotification(String userId, String message, String type) {
//        try {
//            notificationService.sendNotification(userId, message, type);
//        } catch (Exception e) {
//            log.error("Failed to send notification to user {}: {}", userId, e.getMessage());
//        }
//    }

    /**
     * Converts entities to DTOs and logs a READ audit for each.
     *
     * @param actorId   The unique identifier of the user performing the read operation.
     * @param venueList The list of venue entities to convert and audit.
     * @return A list of mapped venue response DTOs.
     */
    private List<VenueResponseDto> convertAndAudit(String actorId, List<Venue> venueList) {
        return venueList.stream()
//                .peek(v -> auditService.logAudit(actorId, AuditAction.READ, Venue.class, v.getVenueId()))
                .map(venueResponseDtoMapper::toDto)
                .toList();
    }

    /**
     * Registers a new venue in the system.
     *
     * @param actorId The unique identifier of the user performing the creation.
     * @param dto     The venue request data transfer object.
     * @return The saved venue as a response DTO.
     */
    @Override
    @Transactional
    public VenueResponseDto create(String actorId, VenueRequestDto dto) {
        Venue venue = venueRequestDtoMapper.toEntity(dto);

        Venue savedVenue = venueRepository.save(venue);

        log.info("Venue created with id: {} by actor: {}", savedVenue.getVenueId(), actorId);
//        auditService.logAudit(actorId, AuditAction.CREATE, Venue.class, savedVenue.getVenueId());
//
//        sendSafeNotification(actorId, String.format("Venue '%s' has been successfully registered.", savedVenue.getName()), "VENUE");

        return venueResponseDtoMapper.toDto(savedVenue);
    }

    /**
     * Retrieves all venues available in the system.
     *
     * @param actorId The unique identifier of the user requesting the data.
     * @return A list of all venue response DTOs.
     */
    @Override
    public List<VenueResponseDto> findAll(String actorId) {
        log.info("Fetching all venues by actor: {}", actorId);
        List<Venue> venues = venueRepository.findAll();
        return convertAndAudit(actorId, venues);
    }

    /**
     * Retrieves venue details for a batch of venue IDs in a single DB query.
     * Venues whose IDs are not found are silently omitted from the result.
     *
     * @param ids the list of venue UUIDs to look up
     * @return a list of matched VenueResponseDto objects
     */
    @Override
    public List<VenueResponseDto> findAllByIds(List<String> ids) {
        log.info("Bulk fetching {} venue id(s)", ids.size());
        return venueRepository.findAllById(ids).stream()
                .map(venueResponseDtoMapper::toDto)
                .toList();
    }

    /**
     * Retrieves venues filtered by a specific geographic location.
     *
     * @param actorId  The unique identifier of the user requesting the data.
     * @param location The location string to search for.
     * @return A list of venues matching the location.
     */
    @Override
    public List<VenueResponseDto> findByLocation(String actorId, String location) {
        log.info("Fetching venues at location: {} by actor: {}", location, actorId);
        List<Venue> venues = venueRepository.findByLocation(location);
        return convertAndAudit(actorId, venues);
    }

    /**
     * Updates an existing venue's information.
     *
     * @param actorId The unique identifier of the user performing the update.
     * @param venueId The ID of the venue to update.
     * @param dto     The new venue details.
     * @return The updated venue response DTO.
     * @throws VenueNotFoundException if no venue exists with the given ID.
     */
    @Override
    @Transactional
    public VenueResponseDto updateVenue(String actorId, String venueId, VenueRequestDto dto) {
        Venue existingVenue = venueRepository.findById(venueId)
                .orElseThrow(() -> new VenueNotFoundException("Venue not found with id: " + venueId));

        Venue updatedVenue = venueRequestDtoMapper.toEntity(dto);
        updatedVenue.setVenueId(existingVenue.getVenueId());
        Venue saved = venueRepository.save(updatedVenue);

        log.info("Venue updated with id: {} by actor: {}", venueId, actorId);
//        auditService.logAudit(actorId, AuditAction.UPDATE, Venue.class, venueId);
//
//        sendSafeNotification(actorId, String.format("Details for venue '%s' have been updated.", saved.getName()), "VENUE");

        return venueResponseDtoMapper.toDto(saved);
    }

    /**
     * Updates only the availability status of a specific venue.
     *
     * @param actorId The unique identifier of the user performing the update.
     * @param venueId The ID of the venue.
     * @param status  The new availability status.
     * @return The updated venue response DTO.
     * @throws VenueNotFoundException if no venue exists with the given ID.
     */
    @Override
    @Transactional
    public VenueResponseDto updateVenueStatus(String actorId, String venueId, AvailabilityStatus status) {
        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new VenueNotFoundException("Venue not found with id: " + venueId));

        venue.setAvailabilityStatus(status);
        venueRepository.save(venue);

        log.info("Venue status updated for id: {} to {} by actor: {}", venueId, status, actorId);
//        auditService.logAudit(actorId, AuditAction.UPDATE, Venue.class, venueId);
//
//        sendSafeNotification(actorId, String.format("Venue '%s' status changed to %s.", venue.getName(), status), "VENUE_STATUS");

        return venueResponseDtoMapper.toDto(venue);
    }

    /**
     * Deletes a venue from the system by its ID.
     *
     * @param actorId The unique identifier of the user performing the deletion.
     * @param venueId The ID of the venue to be removed.
     * @throws VenueNotFoundException if no venue exists with the given ID.
     */
    @Override
    @Transactional
    public void deleteVenue(String actorId, String venueId) {
        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new VenueNotFoundException("Venue not found with id: " + venueId));

        String venueName = venue.getName();
        venueRepository.deleteById(venueId);

        log.info("Venue deleted with id: {} by actor: {}", venueId, actorId);
//        auditService.logAudit(actorId, AuditAction.DELETE, Venue.class, venueId);
//
//        sendSafeNotification(actorId, String.format("Venue '%s' has been removed from the system.", venueName), "VENUE_DELETE");
    }

    /**
     * Finds venues that are free on a specific date.
     *
     * @param actorId The unique identifier of the user requesting the data.
     * @param date    The date string in yyyy-MM-dd format.
     * @return A list of available venues for that date.
     * @throws IllegalArgumentException if the date format is invalid.
     */
    @Override
    public List<VenueResponseDto> findByDate(String actorId, String date) {
        try {
            log.info("Fetching venues for date: {} by actor: {}", date, actorId);
            LocalDate localDate = LocalDate.parse(date);
            List<Venue> freeVenues = null;

            return convertAndAudit(actorId, freeVenues);
        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException("Invalid date format. Please use yyyy-MM-dd", e);
        }
    }

    /**
     * Retrieves venues that have a capacity equal to or greater than the specified amount.
     *
     * @param actorId  The unique identifier of the user requesting the data.
     * @param capacity The minimum capacity required.
     * @return A list of venues meeting the capacity criteria.
     */
    @Override
    public List<VenueResponseDto> findByCapacity(String actorId, int capacity) {
        log.info("Fetching venues with capacity >= {} by actor: {}", capacity, actorId);
        List<Venue> venues = venueRepository.findByCapacityGreaterThanEqual(capacity);
        return convertAndAudit(actorId, venues);
    }

    /**
     * Filters venues based on their current availability status.
     *
     * @param actorId The unique identifier of the user requesting the data.
     * @param status  The status to filter by.
     * @return A list of venues matching the status.
     */
    @Override
    public List<VenueResponseDto> findByAvailabilityStatus(String actorId, AvailabilityStatus status) {
        log.info("Fetching venues with status: {} by actor: {}", status, actorId);
        List<Venue> venues = venueRepository.findByAvailabilityStatus(status);
        return convertAndAudit(actorId, venues);
    }
}
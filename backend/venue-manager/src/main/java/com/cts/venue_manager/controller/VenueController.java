package com.cts.venue_manager.controller;

import com.cts.venue_manager.dto.venue.VenueRequestDto;
import com.cts.venue_manager.dto.venue.VenueResponseDto;
import com.cts.venue_manager.model.data.AvailabilityStatus;
import com.cts.venue_manager.auth.dto.UserPrincipal;
import com.cts.venue_manager.service.VenueService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
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
 * REST controller for managing venue entities with integrated audit and security support.
 * This controller provides endpoints for venue lifecycle operations including creation,
 * status updates, and various search filters, restricted by user roles.
 *
 * @author 2479476
 * @version 1.0
 * @since 2026-03-26
 */
@RestController
@Slf4j
@RequestMapping("/venues")
@RequiredArgsConstructor
@Validated
public class VenueController {

    private final VenueService venueService;

    /**
     * Creates a new venue record in the system.
     * Restricted to users with the VENUE_MANAGER role.
     *
     * @param venueRequestDto the data transfer object containing new venue details
     * @param userPrincipal the authenticated user details for audit tracking
     * @return a ResponseEntity containing the created venue and HTTP status 201
     */
    @PostMapping
    @PreAuthorize("hasRole('VENUE_MANAGER')")
    public ResponseEntity<VenueResponseDto> addVenue(
            @RequestBody @Valid VenueRequestDto venueRequestDto,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        String actorId = userPrincipal.userId();
        log.info("REST request to add a new venue: {} by actor: {}", venueRequestDto.name(), actorId);
        VenueResponseDto created = venueService.create(actorId, venueRequestDto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    /**
     * Retrieves all venues registered in the system.
     * Accessible by ORGANIZER, ADMIN, and VENUE_MANAGER roles.
     *
     * @param userPrincipal the authenticated user details for audit tracking
     * @return a ResponseEntity containing a list of all venues
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN', 'VENUE_MANAGER')")
    public ResponseEntity<List<VenueResponseDto>> getAllVenue(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        String actorId = userPrincipal.userId();
        log.info("Request to fetch all venues by actor: {}", actorId);
        List<VenueResponseDto> venues = venueService.findAll(actorId);
        return ResponseEntity.ok(venues);
    }

    /**
     * Updates the core details of an existing venue.
     * Restricted to users with the VENUE_MANAGER role.
     *
     * @param venueId the unique identifier of the venue to update
     * @param venueRequestDto the updated data for the venue
     * @param userPrincipal the authenticated user details for audit tracking
     * @return a ResponseEntity containing the updated venue details
     */
    @PutMapping("/{venueId}")
    @PreAuthorize("hasRole('VENUE_MANAGER')")
    public ResponseEntity<VenueResponseDto> updateVenue(
            @PathVariable String venueId,
            @RequestBody @Valid VenueRequestDto venueRequestDto,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        String actorId = userPrincipal.userId();
        log.info("REST request to update venue ID: {} by actor: {}", venueId, actorId);
        VenueResponseDto updated = venueService.updateVenue(actorId, venueId, venueRequestDto);
        return ResponseEntity.ok(updated);
    }

    /**
     * Updates only the availability status of a specific venue.
     * Restricted to users with the VENUE_MANAGER role.
     *
     * @param venueId the unique identifier of the venue
     * @param status the new AvailabilityStatus to be applied
     * @param userPrincipal the authenticated user details for audit tracking
     * @return a ResponseEntity containing the updated venue details
     */
    @PatchMapping("/{venueId}/status")
    @PreAuthorize("hasRole('VENUE_MANAGER')")
    public ResponseEntity<VenueResponseDto> updateVenueStatus(
            @PathVariable String venueId,
            @RequestParam AvailabilityStatus status,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        String actorId = userPrincipal.userId();
        log.info("REST request to update status for venue ID: {} to {} by actor: {}", venueId, status, actorId);
        VenueResponseDto updated = venueService.updateVenueStatus(actorId, venueId, status);
        return ResponseEntity.ok(updated);
    }

    /**
     * Deletes a venue from the system based on its ID.
     * Restricted to VENUE_MANAGER or ADMIN roles.
     *
     * @param venueId the unique identifier of the venue to delete
     * @param userPrincipal the authenticated user details for audit tracking
     * @return a ResponseEntity with no content and HTTP status 204
     */
    @DeleteMapping("/{venueId}")
    @PreAuthorize("hasAnyRole('VENUE_MANAGER', 'ADMIN')")
    public ResponseEntity<Void> deleteVenue(
            @PathVariable String venueId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        String actorId = userPrincipal.userId();
        log.info("REST request to delete venue ID: {} by actor: {}", venueId, actorId);
        venueService.deleteVenue(actorId, venueId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Searches for venues based on a specific location string.
     *
     * @param location the physical location to filter venues by
     * @param userPrincipal the authenticated user details for audit tracking
     * @return a ResponseEntity containing a list of venues in that location
     */
    @GetMapping("/location/{location}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<VenueResponseDto>> getVenueByLocation(
            @PathVariable String location,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        String actorId = userPrincipal.userId();
        log.info("Searching for venues in location: {} by actor: {}", location, actorId);
        List<VenueResponseDto> venues = venueService.findByLocation(actorId, location);
        return ResponseEntity.ok(venues);
    }

    /**
     * Filters venues that meet a minimum capacity requirement.
     *
     * @param capacity the minimum attendee count required
     * @param userPrincipal the authenticated user details for audit tracking
     * @return a ResponseEntity containing a list of venues meeting the capacity
     */
    @GetMapping("/capacity/{capacity}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<VenueResponseDto>> getVenueByCapacity(
            @PathVariable int capacity,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        String actorId = userPrincipal.userId();
        log.info("Searching for venues with minimum capacity: {} by actor: {}", capacity, actorId);
        List<VenueResponseDto> venues = venueService.findByCapacity(actorId, capacity);
        return ResponseEntity.ok(venues);
    }

    /**
     * Filters venues based on their current operational status.
     *
     * @param status the status (available, unavailable, etc.) to filter by
     * @param userPrincipal the authenticated user details for audit tracking
     * @return a ResponseEntity containing a list of venues with the specified status
     */
    @GetMapping("/status/{status}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<VenueResponseDto>> getVenueByStatus(
            @PathVariable AvailabilityStatus status,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        String actorId = userPrincipal.userId();
        log.info("Filtering venues by status: {} by actor: {}", status, actorId);
        List<VenueResponseDto> venues = venueService.findByAvailabilityStatus(actorId, status);
        return ResponseEntity.ok(venues);
    }

    /**
     * Checks venue availability for a specific booking date.
     *
     * @param date the date string to check against existing bookings
     * @param userPrincipal the authenticated user details for audit tracking
     * @return a ResponseEntity containing a list of available venues for that date
     */
    @GetMapping("/date/{date}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<VenueResponseDto>> getVenueByDate(
            @PathVariable String date,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        String actorId = userPrincipal.userId();
        log.info("Checking venue availability for date: {} by actor: {}", date, actorId);
        List<VenueResponseDto> venues = venueService.findByDate(actorId, date);
        return ResponseEntity.ok(venues);
    }

    /**
     * Retrieves venue details for a batch of venue IDs in a single request.
     * Restricted to service accounts (SYS_EVENT_MGR) to support service-to-service lookups.
     *
     * @param ids the list of venue UUIDs to look up (max 100)
     * @return a list of VenueResponseDto for the matched venues
     */
    @PostMapping("/bulk")
    @PreAuthorize("hasRole('SYS_EVENT_MGR')")
    public ResponseEntity<List<VenueResponseDto>> getVenuesByIds(
            @RequestBody @Size(min = 1, max = 50, message = "Batch size must be between 1 and 50") List<String> ids) {
        log.info("Bulk venue lookup for {} id(s)", ids.size());
        return ResponseEntity.ok(venueService.findAllByIds(ids));
    }
}
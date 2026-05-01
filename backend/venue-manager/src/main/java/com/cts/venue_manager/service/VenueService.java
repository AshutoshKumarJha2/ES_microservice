package com.cts.venue_manager.service;

import com.cts.venue_manager.dto.venue.VenueRequestDto;
import com.cts.venue_manager.dto.venue.VenueResponseDto;
import com.cts.venue_manager.model.data.AvailabilityStatus;

import java.util.List;

/**
 * Service interface for managing venue-related operations within the EventSphere system.
 * This interface defines the contract for venue lifecycle management, including
 * creation, retrieval, updates, and deletion, integrated with actor-based auditing.
 *
 * @author 2479476
 * @version 1.0
 * @since 2026-03-26
 */
public interface VenueService {

    /**
     * Creates a new venue record in the system.
     * Processes the provided DTO to persist a new venue entity and returns the mapped response.
     *
     * @param actorId the unique identifier of the user performing the creation
     * @param dto the data transfer object containing venue details
     * @return the created venue details as a VenueResponseDto
     */
    VenueResponseDto create(String actorId, VenueRequestDto dto);

    /**
     * Retrieves a list of all venues registered in the system.
     * Fetches all venue records regardless of status for administrative or overview purposes.
     *
     * @param actorId the unique identifier of the user requesting the data
     * @return a list of all venues as VenueResponseDto objects
     */
    List<VenueResponseDto> findAll(String actorId);

    /**
     * Finds venues based on their physical location.
     * Performs a filtered search to return venues located in a specific area or city.
     *
     * @param actorId the unique identifier of the user requesting the data
     * @param location the geographic location string to filter by
     * @return a list of venues matching the specified location
     */
    List<VenueResponseDto> findByLocation(String actorId, String location);

    /**
     * Updates an existing venue's core information.
     * Modifies attributes such as name, capacity, or location based on the provided identifier.
     *
     * @param actorId the unique identifier of the user performing the update
     * @param venueId the unique identifier of the venue to be updated
     * @param dto the data transfer object containing the updated venue information
     * @return the updated venue details as a VenueResponseDto
     */
    VenueResponseDto updateVenue(String actorId, String venueId, VenueRequestDto dto);

    /**
     * Specifically updates the availability status of a venue.
     * Used to toggle a venue between available, unavailable, or maintenance states.
     *
     * @param actorId the unique identifier of the user performing the status change
     * @param venueId the unique identifier of the venue
     * @param status the new availability status to be applied
     * @return the updated venue details with the new status
     */
    VenueResponseDto updateVenueStatus(String actorId, String venueId, AvailabilityStatus status);

    /**
     * Removes a venue record from the system.
     * Performs a deletion of the venue identified by the provided ID; may impact associated bookings.
     *
     * @param actorId the unique identifier of the user performing the deletion
     * @param venueId the unique identifier of the venue to be removed
     */
    void deleteVenue(String actorId, String venueId);

    /**
     * Finds venues that are free for booking on a specific date.
     * Filters venues by checking existing booking records against the requested date.
     *
     * @param actorId the unique identifier of the user requesting the data
     * @param date the ISO date string to check for availability
     * @return a list of venues available on the specified date
     */
    List<VenueResponseDto> findByDate(String actorId, String date);

    /**
     * Finds venues that meet or exceed a minimum capacity requirement.
     * Useful for filtering venues based on the expected number of event attendees.
     *
     * @param actorId the unique identifier of the user requesting the data
     * @param capacity the minimum attendee capacity required
     * @return a list of venues meeting the capacity threshold
     */
    List<VenueResponseDto> findByCapacity(String actorId, int capacity);

    /**
     * Finds venues filtered by their current operational status.
     *
     * @param actorId the unique identifier of the user requesting the data
     * @param status the operational status (e.g., available, maintenance) to filter by
     * @return a list of venues currently in the specified status
     */
    List<VenueResponseDto> findByAvailabilityStatus(String actorId, AvailabilityStatus status);

    /**
     * Retrieves venue details for a batch of venue IDs.
     * Venues whose IDs are not found are silently omitted from the result.
     *
     * @param ids the list of venue UUIDs to look up (max 100)
     * @return a list of VenueResponseDto for the matched venues
     */
    List<VenueResponseDto> findAllByIds(List<String> ids);

    /**
     * Retrieves all venues managed by a specific venue manager.
     *
     * @param actorId   the unique identifier of the user requesting the data
     * @param managerId the unique identifier of the venue manager
     * @return a list of venues assigned to the specified manager
     */
    List<VenueResponseDto> findVenuesByManager(String actorId, String managerId);
}
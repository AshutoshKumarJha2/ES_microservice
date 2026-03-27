package com.cts.venue_manager.service;

import com.cts.venue_manager.dto.resource.ResourceListElementDto;
import com.cts.venue_manager.dto.resource.ResourceRequestDto;
import com.cts.venue_manager.dto.resource.ResourceResponseDto;

import java.util.List;

/**
 * Service interface for managing resource inventory and allocations.
 * All operations are tracked via actorId for comprehensive auditing.
 *
 * @author 2479476
 * @version 1.1
 * @since 05-03-2026
 */
public interface ResourceService {

    /**
     * Adds a new resource to the inventory.
     * * @param actorId the unique identifier of the user performing the creation
     * @param venueId the unique identifier of the venue
     * @param resourceRequestDto the data transfer object containing resource details
     * @return the created resource details
     */
    ResourceResponseDto createResource(String actorId, String venueId, ResourceRequestDto resourceRequestDto);

    /**
     * Retrieves all available resources.
     * * @param actorId the unique identifier of the user requesting the data
     * @return a list of all resource response DTOs
     */
    List<ResourceResponseDto> getAllResources(String actorId);

    /**
     * Approves a specific resource allocation and updates inventory.
     * * @param actorId the unique identifier of the user performing the approval
     * @param allocationId the unique identifier of the allocation request
     */
    void approveAllocation(String actorId, String allocationId);

    /**
     * Finds a specific resource by its UUID.
     * * @param actorId the unique identifier of the user requesting the data
     * @param resourceId the unique identifier of the resource
     * @return the found resource response DTO
     */
    ResourceResponseDto getResourceById(String actorId, String resourceId);

    /**
     * Updates resource details (e.g., cost rate, availability status).
     * * @param actorId the unique identifier of the user performing the update
     * @param resourceId the unique identifier of the resource to update
     * @param resourceRequestDto the updated resource details
     * @return the updated resource response DTO
     */
    ResourceResponseDto updateResource(String actorId, String resourceId, ResourceRequestDto resourceRequestDto);

    /**
     * Removes a resource from the system.
     * * @param actorId the unique identifier of the user performing the deletion
     * @param resourceId the unique identifier of the resource
     */
    void deleteResource(String actorId, String resourceId);

    // --- Allocation & Workflow Operations ---

    /**
     * Initiates a request for resources and notifies the Approval Manager.
     * * @param actorId the unique identifier of the user requesting allocation
     * @param eventId the event for which resources are requested
     * @param bookingId the associated booking ID
     * @param venueId the venue where resources are located
     * @param resources the list of resources and quantities requested
     */
    void requestAllocation(String actorId, String bookingId, String eventId, String venueId, List<ResourceListElementDto> resources);

    /**
     * Retrieves all resources associated with a specific venue.
     * * @param actorId the unique identifier of the user requesting the data
     * @param venueId the unique identifier of the venue
     * @return a list of resources associated with the specified venue
     */
    List<ResourceResponseDto> getResourcesByVenue(String actorId, String venueId);
}
package com.cts.venue_manager.controller;

import com.cts.venue_manager.dto.resource.ResourceAllocationRequestDto;
import com.cts.venue_manager.dto.resource.ResourceRequestDto;
import com.cts.venue_manager.dto.resource.ResourceResponseDto;
import com.cts.venue_manager.auth.dto.UserPrincipal;
import com.cts.venue_manager.service.ResourceService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.cts.venue_manager.dto.shared.MessageResponseDto;
import java.util.List;

/**
 * Rest Controller for Resource Entity management and allocation.
 *
 * @author 2479476
 * @since 05-03-2026
 */
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Slf4j
@Validated // Required to enable validation for method parameters like @PathVariable
public class ResourceController {

    private final ResourceService resourceService;

    /**
     * Create a new resource associated with a specific venue.
     * Restricted to Venue Managers.
     *
     * @param venueId the unique identifier of the venue
     * @param requestDto the data transfer object containing resource details
     * @param userPrincipal the authenticated user performing the action
     * @return the created resource details wrapped in a ResponseEntity
     */
    @PostMapping("/venues/{venueId}/resources")
    @PreAuthorize("hasRole('VENUE_MANAGER')")
    public ResponseEntity<ResourceResponseDto> createResource(
            @PathVariable @NotBlank(message = "Venue ID is required") String venueId,
            @RequestBody @Valid ResourceRequestDto requestDto,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        String actorId = userPrincipal.userId();
        log.info("REST request to create resource for venue {} by actor {}: {}", venueId, actorId, requestDto);
        ResourceResponseDto response = resourceService.createResource(actorId, venueId, requestDto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * Retrieve all resources in the system.
     *
     * @param userPrincipal the authenticated user performing the action
     * @return a list of all resource response DTOs
     */
    @GetMapping("/resources")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ResourceResponseDto>> getAllResources(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        String actorId = userPrincipal.userId();
        log.info("REST request to get all resources by actor: {}", actorId);
        return ResponseEntity.ok(resourceService.getAllResources(actorId));
    }

    /**
     * Get a specific resource by its unique ID.
     *
     * @param resourceId the unique identifier of the resource
     * @param userPrincipal the authenticated user performing the action
     * @return the resource details wrapped in a ResponseEntity
     */
    @GetMapping("/resources/{resourceId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ResourceResponseDto> getResourceById(
            @PathVariable @NotBlank(message = "Resource ID is required") String resourceId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        String actorId = userPrincipal.userId();
        log.info("REST request to get resource by ID: {} by actor: {}", resourceId, actorId);
        return ResponseEntity.ok(resourceService.getResourceById(actorId, resourceId));
    }

    /**
     * Get all resources belonging to a specific venue.
     * Accessible by Venue Managers, Organizers, or Admins.
     *
     * @param venueId the unique identifier of the venue
     * @param userPrincipal the authenticated user performing the action
     * @return a list of resources associated with the specified venue
     */
    @GetMapping("/venues/{venueId}/resources")
    @PreAuthorize("hasAnyRole('VENUE_MANAGER', 'ORGANIZER', 'ADMIN')")
    public ResponseEntity<List<ResourceResponseDto>> getResourcesByVenue(
            @PathVariable @NotBlank(message = "Venue ID is required") String venueId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        String actorId = userPrincipal.userId();
        log.info("REST request to get resources for venue ID: {} by actor: {}", venueId, actorId);
        return ResponseEntity.ok(resourceService.getResourcesByVenue(actorId, venueId));
    }

    /**
     * Request resource allocation for a booking.
     * Restricted to Organizers.
     *
     * @param requestDto the allocation request details
     * @param userPrincipal the authenticated user performing the action
     * @return a success message string wrapped in a ResponseEntity
     */
    @PostMapping("/resources/allocation")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<MessageResponseDto> requestAllocation(
            @RequestBody @Valid ResourceAllocationRequestDto requestDto,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        String actorId = userPrincipal.userId();
        log.info("REST request to allocate resources by actor {}: {}", actorId, requestDto);
        resourceService.requestAllocation(
                actorId,
                requestDto.bookingId(),
                requestDto.eventId(),
                requestDto.venueId(),
                requestDto.resourceListElement()
        );
        return new ResponseEntity<>(new MessageResponseDto("Resource Requested"), HttpStatus.CREATED);
    }

    /**
     * Approve a resource allocation and deduct units from inventory.
     * Restricted to Venue Managers.
     *
     * @param allocationId the unique identifier of the allocation request
     * @param userPrincipal the authenticated user performing the action
     * @return a confirmation message string wrapped in a ResponseEntity
     */
    @PatchMapping("/resources/allocation/{eventId}/approve")
    @PreAuthorize("hasRole('VENUE_MANAGER')")
    public ResponseEntity<MessageResponseDto> approveAllocation(
            @PathVariable @NotBlank(message = "Event ID is required") String eventId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        String actorId = userPrincipal.userId();
        log.info("REST request to approve all allocations for event: {} by actor: {}", eventId, actorId);
        resourceService.approveAllocation(actorId, eventId);
        return ResponseEntity.ok(new MessageResponseDto("Resource allocations approved and inventory updated."));
    }

    /**
     * Update an existing resource.
     * Restricted to Venue Managers.
     *
     * @param resourceId the unique identifier of the resource to update
     * @param requestDto the updated resource details
     * @param userPrincipal the authenticated user performing the action
     * @return the updated resource response DTO
     */
    @PutMapping("/resources/{resourceId}")
    @PreAuthorize("hasRole('VENUE_MANAGER')")
    public ResponseEntity<ResourceResponseDto> updateResource(
            @PathVariable @NotBlank(message = "Resource ID is required") String resourceId,
            @RequestBody @Valid ResourceRequestDto requestDto,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        String actorId = userPrincipal.userId();
        log.info("REST request to update resource ID: {} by actor: {}", resourceId, actorId);
        return ResponseEntity.ok(resourceService.updateResource(actorId, resourceId, requestDto));
    }

    /**
     * Delete a resource from the system.
     * Restricted to Venue Managers or Admins.
     *
     * @param resourceId the unique identifier of the resource to delete
     * @param userPrincipal the authenticated user performing the action
     * @return an empty ResponseEntity with No Content status
     */
    @DeleteMapping("/resources/{resourceId}")
    @PreAuthorize("hasAnyRole('VENUE_MANAGER', 'ADMIN')")
    public ResponseEntity<Void> deleteResource(
            @PathVariable @NotBlank(message = "Resource ID is required") String resourceId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        String actorId = userPrincipal.userId();
        log.warn("REST request to delete resource ID: {} by actor: {}", resourceId, actorId);
        resourceService.deleteResource(actorId, resourceId);
        return ResponseEntity.noContent().build();
    }
}
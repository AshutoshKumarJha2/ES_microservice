package com.cts.venue_manager.service.impl;

import com.cts.venue_manager.dto.mapper.resource.ResourceRequestDtoMapper;
import com.cts.venue_manager.dto.mapper.resource.ResourceResponseDtoMapper;
import com.cts.venue_manager.dto.resource.ResourceListElementDto;
import com.cts.venue_manager.dto.resource.ResourceRequestDto;
import com.cts.venue_manager.dto.resource.ResourceResponseDto;
import com.cts.venue_manager.exception.event.EventNotFoundException;
import com.cts.venue_manager.exception.resource.InsufficientResourceException;
import com.cts.venue_manager.exception.resource.ResourceAlreadyExistsException;
import com.cts.venue_manager.exception.resource.ResourceDuplicateAllocationException;
import com.cts.venue_manager.exception.resource.ResourceNotFoundException;
import com.cts.venue_manager.exception.venue.VenueNotFoundException;
import com.cts.venue_manager.model.Event;
import com.cts.venue_manager.model.Resource;
import com.cts.venue_manager.model.ResourceAllocation;
import com.cts.venue_manager.model.Venue;
import com.cts.venue_manager.model.data.AuditAction;
import com.cts.venue_manager.repository.EventRepository;
import com.cts.venue_manager.repository.ResourceAllocationRepository;
import com.cts.venue_manager.repository.ResourceRepository;
import com.cts.venue_manager.repository.VenueRepository;
import com.cts.venue_manager.service.AuditService;
import com.cts.venue_manager.service.NotificationService;
import com.cts.venue_manager.service.ResourceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service implementation for managing inventory resources and their allocations.
 * Integrated with AuditService for tracking all management actions and NotificationService for alerts.
 *
 * @author 2479476
 * @version 1.1
 * @since 05-03-2026
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ResourceServiceImpl implements ResourceService {

    private final ResourceRepository resourceRepository;
    private final EventRepository eventRepository;
    private final VenueRepository venueRepository;
    private final ResourceAllocationRepository resourceAllocationRepository;
    private final AuditService auditService;
    private final NotificationService notificationService;

    /**
     * Helper method to send notifications safely without breaking the main transaction.
     *
     * @param userId  The unique identifier of the user to receive the notification.
     * @param message The content of the notification.
     * @param type    The category/type of notification.
     */
    private void sendSafeNotification(String userId, String message, String type) {
        try {
            notificationService.sendNotification(userId, message, type);
        } catch (Exception e) {
            log.error("Failed to send notification to user {}: {}", userId, e.getMessage());
        }
    }

    /**
     * Creates a new resource associated with a specific venue.
     *
     * @param actorId the unique identifier of the user performing the creation
     * @param venueId the unique identifier of the venue
     * @param resourceRequestDto the data transfer object for resource creation
     * @return the created resource response DTO
     * @throws ResourceAlreadyExistsException if a resource with the same name exists
     */
    @Override
    @Transactional
    public ResourceResponseDto createResource(String actorId, String venueId, ResourceRequestDto resourceRequestDto) {
        log.info("Actor {} initiating resource creation: {}", actorId, resourceRequestDto.name());

        if (resourceRepository.existsByName(resourceRequestDto.name())) {
            log.warn("Resource creation failed: Name '{}' already exists", resourceRequestDto.name());
            throw new ResourceAlreadyExistsException("Resource already exists with name: " + resourceRequestDto.name());
        }

        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new VenueNotFoundException("Venue not found with id: " + venueId));

        Resource resource = ResourceRequestDtoMapper.toEntity(resourceRequestDto);
        resource.setVenue(venue);
        Resource savedResource = resourceRepository.save(resource);

        auditService.logAudit(actorId, AuditAction.CREATE, Resource.class, savedResource.getResourceId());

        sendSafeNotification(actorId,
                String.format("Resource '%s' successfully created for venue '%s'.", savedResource.getName(), venue.getName()),
                "RESOURCE_CREATE");

        log.info("Resource successfully created with ID: {} by actor: {}", savedResource.getResourceId(), actorId);

        return ResourceResponseDtoMapper.mapToResponseDto(savedResource);
    }

    /**
     * Retrieves all resources available across the system.
     *
     * @param actorId the unique identifier of the user requesting the data
     * @return a list of all resource response DTOs
     */
    @Override
    public List<ResourceResponseDto> getAllResources(String actorId) {
        log.info("Actor {} fetching all available resources", actorId);
        List<Resource> resources = resourceRepository.findAll();

        return resources.stream()
                .peek(r -> auditService.logAudit(actorId, AuditAction.READ, Resource.class, r.getResourceId()))
                .map(ResourceResponseDtoMapper::mapToResponseDto)
                .collect(Collectors.toList());
    }

    /**
     * Approves an allocation and deducts units from the resource inventory.
     *
     * @param actorId the unique identifier of the user performing the approval
     * @param allocationId the unique identifier of the allocation request
     * @throws InsufficientResourceException if requested units exceed available units
     */
    @Override
    @Transactional
    public void approveAllocation(String actorId, String allocationId) {
        log.info("Actor {} (Venue Manager) approving allocation ID: {}", actorId, allocationId);

        ResourceAllocation allocation = resourceAllocationRepository.findById(allocationId)
                .orElseThrow(() -> new ResourceNotFoundException("Allocation request not found"));

        Resource resource = allocation.getResource();

        if (resource.getUnit() < allocation.getQuantity()) {
            throw new InsufficientResourceException("Cannot approve: Units no longer available");
        }

        resource.setUnit(resource.getUnit() - allocation.getQuantity());
        resourceRepository.save(resource);

        auditService.logAudit(actorId, AuditAction.UPDATE, Resource.class, resource.getResourceId());

        sendSafeNotification(actorId,
                String.format("Allocation for resource '%s' (Qty: %d) has been approved.", resource.getName(), allocation.getQuantity()),
                "ALLOCATION_APPROVE");

        log.info("Allocation approved by {}. Inventory updated for: {}", actorId, resource.getName());
    }

    /**
     * Retrieves resource details by its unique identifier.
     *
     * @param actorId the unique identifier of the user requesting the data
     * @param resourceId the ID of the resource to fetch
     * @return the resource details as a response DTO
     */
    @Override
    public ResourceResponseDto getResourceById(String actorId, String resourceId) {
        log.info("Actor {} fetching resource details for ID: {}", actorId, resourceId);
        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + resourceId));

        auditService.logAudit(actorId, AuditAction.READ, Resource.class, resourceId);
        return ResourceResponseDtoMapper.mapToResponseDto(resource);
    }

    /**
     * Updates an existing resource's core details.
     *
     * @param actorId the unique identifier of the user performing the update
     * @param resourceId the unique identifier of the resource
     * @param dto the updated resource information
     * @return the updated resource response DTO
     */
    @Override
    @Transactional
    public ResourceResponseDto updateResource(String actorId, String resourceId, ResourceRequestDto dto) {
        log.info("Actor {} updating resource ID: {}", actorId, resourceId);

        Resource existingResource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + resourceId));

        existingResource.setName(dto.name());
        existingResource.setType(dto.type());
        existingResource.setCostRate(dto.costRate());
        existingResource.setUnit(dto.unit());

        Resource updatedResource = resourceRepository.save(existingResource);

        auditService.logAudit(actorId, AuditAction.UPDATE, Resource.class, resourceId);

        sendSafeNotification(actorId,
                String.format("Resource '%s' has been successfully updated.", updatedResource.getName()),
                "RESOURCE_UPDATE");

        log.info("Resource ID: {} updated successfully by actor: {}", resourceId, actorId);

        return ResourceResponseDtoMapper.mapToResponseDto(updatedResource);
    }

    /**
     * Deletes a resource from the inventory by its ID.
     *
     * @param actorId the unique identifier of the user performing the deletion
     * @param resourceId the unique identifier of the resource to delete
     * @throws ResourceNotFoundException if the resource ID does not exist
     */
    @Override
    @Transactional
    public void deleteResource(String actorId, String resourceId) {
        log.info("Actor {} attempting to delete resource ID: {}", actorId, resourceId);

        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + resourceId));

        String resourceName = resource.getName();
        resourceRepository.deleteById(resourceId);

        auditService.logAudit(actorId, AuditAction.DELETE, Resource.class, resourceId);

        sendSafeNotification(actorId,
                String.format("Resource '%s' has been removed from the inventory.", resourceName),
                "RESOURCE_DELETE");

        log.info("Resource ID: {} deleted by actor: {}", resourceId, actorId);
    }

    /**
     * Requests allocation of multiple resources for a specific event booking.
     *
     * @param actorId the unique identifier of the user requesting the allocation
     * @param bookingId the unique identifier of the booking
     * @param eventId the unique identifier of the event
     * @param venueId the unique identifier of the venue
     * @param resources the list of resources and their quantities to allocate
     */
    @Override
    @Transactional
    public void requestAllocation(String actorId, String bookingId, String eventId, String venueId, List<ResourceListElementDto> resources) {
        log.info("Actor {} processing allocation for Event: {} at Venue: {}", actorId, eventId, venueId);

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException("Event not found: " + eventId));
        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new ResourceNotFoundException("Venue not found: " + venueId));

        for (ResourceListElementDto resourceReq : resources) {
            Resource resource = resourceRepository.findById(resourceReq.resourceId())
                    .orElseThrow(() -> new ResourceNotFoundException("Resource not found: " + resourceReq.resourceId()));

            if (resourceAllocationRepository.existsByResourceNameAndEventEventId(resource.getName(), eventId)) {
                throw new ResourceDuplicateAllocationException("Resource '" + resource.getName() + "' is already allocated to this event.");
            }

            ResourceAllocation resourceAllocation = ResourceAllocation.builder()
                    .resource(resource)
                    .event(event)
                    .venue(venue)
                    .quantity(resourceReq.quantity())
                    .build();

            resourceAllocationRepository.save(resourceAllocation);
        }

        auditService.logAudit(actorId, AuditAction.UPDATE, Event.class, eventId);

        sendSafeNotification(actorId,
                String.format("Resource allocation requested for event '%s'.", event.getName()),
                "ALLOCATION_REQUEST");

        log.info("Resource allocation request completed for Event: {} by actor: {}", eventId, actorId);
    }

    /**
     * Retrieves all resources belonging to a specific venue.
     *
     * @param actorId the unique identifier of the user requesting the data
     * @param venueId the unique identifier of the venue
     * @return a list of resource response DTOs for the venue
     */
    @Override
    public List<ResourceResponseDto> getResourcesByVenue(String actorId, String venueId) {
        log.info("Actor {} fetching resources for Venue ID: {}", actorId, venueId);
        List<Resource> venueResources = resourceRepository.findByVenue_VenueId(venueId);

        return venueResources.stream()
                .peek(r -> auditService.logAudit(actorId, AuditAction.READ, Resource.class, r.getResourceId()))
                .map(ResourceResponseDtoMapper::mapToResponseDto)
                .collect(Collectors.toList());
    }
}
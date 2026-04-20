package com.cts.venue_manager.dto.mapper.resource;

import com.cts.venue_manager.dto.resource.ResourceVenueManagerResponseDto;
import com.cts.venue_manager.model.ResourceAllocation;
import org.springframework.stereotype.Component;

/**
 * Mapper class responsible for converting ResourceAllocation entities
 * into ResourceVenueManagerResponseDto records.
 *
 * @author 2479476
 * @version 1.0
 * @since 2026-04-17
 */
@Component
public class ResourceVenueManagerDtoMapper {

    /**
     * Constructs a new instance of ResourceVenueManagerDtoMapper.
     */
    public ResourceVenueManagerDtoMapper() {
        // Default constructor for Spring bean initialization
    }

    /**
     * Maps a ResourceAllocation entity to a Response DTO.
     *
     * @param allocation the source entity containing resource data
     * @return a record containing the mapped resource details
     * @throws IllegalArgumentException if the allocation entity is null
     */
    public static ResourceVenueManagerResponseDto toDto(ResourceAllocation allocation) {
        if (allocation == null) {
            throw new IllegalArgumentException("ResourceAllocation entity cannot be null");
        }

        // Ensuring we handle potential NullPointerExceptions if Resource is null
        String name = (allocation.getResource() != null)
                ? allocation.getResource().getName()
                : "Unknown Resource";

        return new ResourceVenueManagerResponseDto(
                allocation.getAllocationId(),
                name,
                allocation.getQuantity()
        );
    }
}
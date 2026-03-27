package com.cts.venue_manager.dto.mapper.resource;

import com.cts.venue_manager.dto.resource.ResourceRequestDto;
import com.cts.venue_manager.dto.resource.ResourceResponseDto;
import com.cts.venue_manager.model.Resource;

/**
 * Mapper utility class responsible for converting Resource entities into various
 * data transfer objects for API responses and internal logging.
 * This class ensures that sensitive entity data is correctly mapped to the
 * presentation layer while maintaining structural integrity.
 *
 * @author 2479476
 * @version 1.0
 * @since 2026-03-26
 */
public class ResourceResponseDtoMapper {

    /**
     * Maps an Entity back to a Request DTO.
     * Primarily used for logging, debugging, or reconciliation tasks where
     * the original request format is required from a persisted entity.
     *
     * @param resource the persistent resource entity to be converted
     * @return a ResourceRequestDto containing the entity's data, or null if input is null
     */
    public static ResourceRequestDto toDto(Resource resource) {
        if (resource == null) {
            return null;
        }

        return new ResourceRequestDto(
                "Resource Name",
                resource.getType(),
                resource.getCostRate(),
                1 // Placeholder for unit/quantity
        );
    }

    /**
     * Converts a Resource entity into a ResourceResponseDto.
     * Maps the internal entity state, including associated venue IDs and
     * availability status, into a format suitable for REST API responses.
     *
     * @param resource the persistent resource entity to be mapped
     * @return a populated ResourceResponseDto containing the resource's public details
     */
    public static ResourceResponseDto mapToResponseDto(Resource resource) {
        return new ResourceResponseDto(
                resource.getResourceId(),
                resource.getVenue().getVenueId(),
                resource.getType(),
                resource.getName(),
                resource.getAvailability(),
                resource.getUnit(),
                resource.getCostRate()
        );
    }
}
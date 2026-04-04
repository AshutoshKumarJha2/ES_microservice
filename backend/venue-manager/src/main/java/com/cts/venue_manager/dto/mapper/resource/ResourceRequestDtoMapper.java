package com.cts.venue_manager.dto.mapper.resource;

import com.cts.venue_manager.dto.resource.ResourceRequestDto;
import com.cts.venue_manager.model.Resource;
import com.cts.venue_manager.model.data.Availability;

/**
 * Mapper utility class responsible for converting resource request data transfer objects
 * into persistent resource entities. This class centralizes the conversion logic
 * and ensures default initial states, such as availability, are correctly set.
 *
 * @author 2479476
 * @version 1.0
 * @since 2026-03-26
 */
public class ResourceRequestDtoMapper {

    /**
     * Maps a ResourceRequestDto to a Resource entity.
     * Extracts fields from the DTO and populates a new Resource object,
     * defaulting the availability status to 'available'.
     *
     * @param dto the data transfer object containing incoming resource details
     * @return a populated Resource entity, or null if the input DTO is null
     */
    public static Resource toEntity(ResourceRequestDto dto) {
        if (dto == null) {
            return null;
        }

        Resource resource = new Resource();

        resource.setName(dto.name());
        resource.setUnit(dto.unit());
        resource.setType(dto.type());
        resource.setCostRate(dto.costRate());

        resource.setAvailability(Availability.AVAILABLE);

        return resource;
    }
}
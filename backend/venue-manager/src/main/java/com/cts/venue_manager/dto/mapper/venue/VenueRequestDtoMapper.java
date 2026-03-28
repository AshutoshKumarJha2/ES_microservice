package com.cts.venue_manager.dto.mapper.venue;

import com.cts.venue_manager.dto.venue.VenueRequestDto;
import com.cts.venue_manager.model.Venue;
import com.cts.venue_manager.model.data.AvailabilityStatus;
import org.springframework.stereotype.Component;

/**
 * DtoMapper from DTO to Venue Entity.
 *
 * @author 2479476
 * @version 1.1
 * @since 2-03-2026
 */
@Component
public class VenueRequestDtoMapper {

    /**
     * Maps a VenueRequestDto to a Venue Entity.
     * Note: CreatedAt/UpdatedAt should be handled by JPA auditing annotations in the Entity.
     * * @param dto the source request DTO
     * @return a mapped Venue entity
     */
    public Venue toEntity(VenueRequestDto dto){
        if (dto == null) {
            return null;
        }

        Venue venue = new Venue();

        venue.setName(dto.name());
        venue.setLocation(dto.location());
        venue.setCapacity(dto.capacity());

        if (dto.availabilityStatus() != null) {
            venue.setAvailabilityStatus(dto.availabilityStatus());
        } else {
            venue.setAvailabilityStatus(AvailabilityStatus.available);
        }

        return venue;
    }
}
package com.cts.venue_manager.dto.mapper.venue;

import com.cts.venue_manager.dto.venue.VenueResponseDto;
import com.cts.venue_manager.model.Venue;
import org.springframework.stereotype.Component;

import java.util.Objects;

/**
 *  DtoMapper from Venue to dto
 *
 * @author 2479476
 * @version 1.0
 * @since 2-03-2026
 */


@Component
public class VenueResponseDtoMapper {

    /**
     * Maps a Venue entity to VenueResponseDto.
     * @param venue the entity to map
     * @return mapped VenueResponseDto, or null if input is null
     */
    public VenueResponseDto toDto(Venue venue) {
        if (Objects.isNull(venue)) {
            return null;
        }
        return new VenueResponseDto(
                venue.getVenueId(),
                venue.getName(),
                venue.getLocation(),
                venue.getCapacity(),
                venue.getAvailabilityStatus(),
                venue.getManagerId()
        );
    }
}
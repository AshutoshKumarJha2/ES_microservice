package com.cts.venue_manager.dto.mapper;

import com.cts.venue_manager.dto.mapper.venue.VenueRequestDtoMapper;
import com.cts.venue_manager.dto.mapper.venue.VenueResponseDtoMapper;
import com.cts.venue_manager.dto.venue.VenueRequestDto;
import com.cts.venue_manager.dto.venue.VenueResponseDto;
import com.cts.venue_manager.model.Venue;
import com.cts.venue_manager.model.data.AvailabilityStatus;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class VenueMapperTest {

    private final VenueRequestDtoMapper requestMapper = new VenueRequestDtoMapper();
    private final VenueResponseDtoMapper responseMapper = new VenueResponseDtoMapper();

    @Test
    void requestMapper_toEntity_mapsAllFields() {
        VenueRequestDto dto = new VenueRequestDto("Expo Center", "Chicago", 800, AvailabilityStatus.available);

        Venue result = requestMapper.toEntity(dto);

        assertThat(result.getName()).isEqualTo("Expo Center");
        assertThat(result.getLocation()).isEqualTo("Chicago");
        assertThat(result.getCapacity()).isEqualTo(800);
        assertThat(result.getAvailabilityStatus()).isEqualTo(AvailabilityStatus.available);
    }

    @Test
    void requestMapper_toEntity_nullStatus_defaultsToAvailable() {
        VenueRequestDto dto = new VenueRequestDto("Open Stage", "Dallas", 200, null);

        Venue result = requestMapper.toEntity(dto);

        assertThat(result.getAvailabilityStatus()).isEqualTo(AvailabilityStatus.available);
    }

    @Test
    void requestMapper_toEntity_nullInput_returnsNull() {
        assertThat(requestMapper.toEntity(null)).isNull();
    }

    @Test
    void responseMapper_toDto_mapsAllFields() {
        Venue venue = new Venue();
        venue.setVenueId("v-999");
        venue.setName("Sunset Arena");
        venue.setLocation("Miami");
        venue.setCapacity(1500);
        venue.setAvailabilityStatus(AvailabilityStatus.unavailable);

        VenueResponseDto result = responseMapper.toDto(venue);

        assertThat(result.id()).isEqualTo("v-999");
        assertThat(result.name()).isEqualTo("Sunset Arena");
        assertThat(result.location()).isEqualTo("Miami");
        assertThat(result.capacity()).isEqualTo(1500);
        assertThat(result.availabilityStatus()).isEqualTo(AvailabilityStatus.unavailable);
    }

    @Test
    void responseMapper_toDto_nullInput_returnsNull() {
        assertThat(responseMapper.toDto(null)).isNull();
    }
}

package com.cts.venue_manager.dto.mapper;

import com.cts.venue_manager.dto.mapper.resource.ResourceRequestDtoMapper;
import com.cts.venue_manager.dto.mapper.resource.ResourceResponseDtoMapper;
import com.cts.venue_manager.dto.resource.ResourceRequestDto;
import com.cts.venue_manager.dto.resource.ResourceResponseDto;
import com.cts.venue_manager.model.Resource;
import com.cts.venue_manager.model.Venue;
import com.cts.venue_manager.model.data.Availability;
import com.cts.venue_manager.model.data.AvailabilityStatus;
import com.cts.venue_manager.model.data.ResourceType;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

class ResourceMapperTest {

    private Venue buildVenue(String venueId) {
        Venue venue = new Venue();
        venue.setVenueId(venueId);
        venue.setName("Arena");
        venue.setLocation("NYC");
        venue.setCapacity(500);
        venue.setAvailabilityStatus(AvailabilityStatus.available);
        return venue;
    }

    @Test
    void requestMapper_toEntity_mapsAllFields() {
        ResourceRequestDto dto = new ResourceRequestDto("Projector", ResourceType.equipment, BigDecimal.valueOf(200), 5);

        Resource result = ResourceRequestDtoMapper.toEntity(dto);

        assertThat(result.getName()).isEqualTo("Projector");
        assertThat(result.getType()).isEqualTo(ResourceType.equipment);
        assertThat(result.getCostRate()).isEqualByComparingTo(BigDecimal.valueOf(200));
        assertThat(result.getUnit()).isEqualTo(5);
        assertThat(result.getAvailability()).isEqualTo(Availability.available);
    }

    @Test
    void requestMapper_toEntity_nullInput_returnsNull() {
        assertThat(ResourceRequestDtoMapper.toEntity(null)).isNull();
    }

    @Test
    void responseMapper_toDto_mapsFields() {
        Resource resource = new Resource();
        resource.setResourceId("r-1");
        resource.setName("Microphone");
        resource.setType(ResourceType.equipment);
        resource.setCostRate(BigDecimal.valueOf(50));
        resource.setUnit(10);
        resource.setAvailability(Availability.in_use);

        ResourceRequestDto result = ResourceResponseDtoMapper.toDto(resource);

        assertThat(result).isNotNull();
        assertThat(result.type()).isEqualTo(ResourceType.equipment);
        assertThat(result.costRate()).isEqualByComparingTo(BigDecimal.valueOf(50));
    }

    @Test
    void responseMapper_toDto_nullInput_returnsNull() {
        assertThat(ResourceResponseDtoMapper.toDto(null)).isNull();
    }

    @Test
    void responseMapper_mapToResponseDto_mapsAllFields() {
        Resource resource = new Resource();
        resource.setResourceId("r-2");
        resource.setVenue(buildVenue("v-10"));
        resource.setType(ResourceType.staff);
        resource.setName("Security Guard");
        resource.setAvailability(Availability.available);
        resource.setUnit(3);
        resource.setCostRate(BigDecimal.valueOf(150));

        ResourceResponseDto result = ResourceResponseDtoMapper.mapToResponseDto(resource);

        assertThat(result.resourceId()).isEqualTo("r-2");
        assertThat(result.venueId()).isEqualTo("v-10");
        assertThat(result.type()).isEqualTo(ResourceType.staff);
        assertThat(result.name()).isEqualTo("Security Guard");
        assertThat(result.availability()).isEqualTo(Availability.available);
        assertThat(result.unit()).isEqualTo(3);
        assertThat(result.costRate()).isEqualByComparingTo(BigDecimal.valueOf(150));
    }
}

package com.cts.eventsphere.vendormanager.dto.mapper;

import com.cts.eventsphere.vendormanager.dto.mapper.vendor.VendorRequestDtoMapper;
import com.cts.eventsphere.vendormanager.dto.mapper.vendor.VendorResponseDtoMapper;
import com.cts.eventsphere.vendormanager.dto.vendor.VendorRequestDto;
import com.cts.eventsphere.vendormanager.dto.vendor.VendorResponseDto;
import com.cts.eventsphere.vendormanager.model.Vendor;
import com.cts.eventsphere.vendormanager.model.data.VendorStatus;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class VendorMapperTest {

    private final VendorRequestDtoMapper requestMapper = new VendorRequestDtoMapper();
    private final VendorResponseDtoMapper responseMapper = new VendorResponseDtoMapper();

    @Test
    void requestMapper_toEntity_mapsAllFields() {
        VendorRequestDto dto = new VendorRequestDto("TechSupplies", "tech@supplies.com", VendorStatus.ACTIVE);

        Vendor result = requestMapper.toEntity(dto);

        assertThat(result.getName()).isEqualTo("TechSupplies");
        assertThat(result.getContactInfo()).isEqualTo("tech@supplies.com");
        assertThat(result.getStatus()).isEqualTo(VendorStatus.ACTIVE);
    }

    @Test
    void requestMapper_toEntity_nullInput_returnsNull() {
        assertThat(requestMapper.toEntity(null)).isNull();
    }

    @Test
    void responseMapper_toDto_mapsAllFields() {
        LocalDateTime now = LocalDateTime.now();
        Vendor vendor = new Vendor();
        vendor.setVendorId("v-123");
        vendor.setName("EventGear");
        vendor.setContactInfo("gear@event.com");
        vendor.setStatus(VendorStatus.INACTIVE);
        vendor.setCreatedAt(now);
        vendor.setUpdatedAt(now);

        VendorResponseDto result = responseMapper.toDto(vendor);

        assertThat(result.vendorId()).isEqualTo("v-123");
        assertThat(result.name()).isEqualTo("EventGear");
        assertThat(result.contactInfo()).isEqualTo("gear@event.com");
        assertThat(result.status()).isEqualTo(VendorStatus.INACTIVE);
        assertThat(result.createdAt()).isEqualTo(now);
        assertThat(result.updatedAt()).isEqualTo(now);
    }

    @Test
    void responseMapper_toDto_nullInput_returnsNull() {
        assertThat(responseMapper.toDto(null)).isNull();
    }
}

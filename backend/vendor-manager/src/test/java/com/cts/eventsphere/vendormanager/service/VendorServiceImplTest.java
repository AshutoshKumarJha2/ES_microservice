package com.cts.eventsphere.vendormanager.service;

import com.cts.eventsphere.vendormanager.dto.mapper.vendor.VendorRequestDtoMapper;
import com.cts.eventsphere.vendormanager.dto.mapper.vendor.VendorResponseDtoMapper;
import com.cts.eventsphere.vendormanager.dto.vendor.VendorRequestDto;
import com.cts.eventsphere.vendormanager.dto.vendor.VendorResponseDto;
import com.cts.eventsphere.vendormanager.exception.vendor.VendorNotFoundException;
import com.cts.eventsphere.vendormanager.model.Vendor;
import com.cts.eventsphere.vendormanager.model.data.VendorStatus;
import com.cts.eventsphere.vendormanager.repository.VendorRepository;
import com.cts.eventsphere.vendormanager.service.impl.VendorServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VendorServiceImplTest {

    @Mock
    private VendorRepository vendorRepository;

    @Mock
    private VendorRequestDtoMapper requestDtoMapper;

    @Mock
    private VendorResponseDtoMapper responseDtoMapper;

    @InjectMocks
    private VendorServiceImpl vendorService;

    private static final String ACTOR_ID = "actor-1";
    private static final String VENDOR_ID = "vendor-100";

    private Vendor buildVendor(String id) {
        Vendor vendor = new Vendor();
        vendor.setVendorId(id);
        vendor.setName("Acme Corp");
        vendor.setContactInfo("contact@acme.com");
        vendor.setStatus(VendorStatus.ACTIVE);
        vendor.setCreatedAt(LocalDateTime.now());
        vendor.setUpdatedAt(LocalDateTime.now());
        return vendor;
    }

    private VendorResponseDto buildResponseDto(String id) {
        return new VendorResponseDto(id, "Acme Corp", "contact@acme.com",
                VendorStatus.ACTIVE, LocalDateTime.now(), LocalDateTime.now());
    }

    // ─── createVendor ─────────────────────────────────────────────────────────

    @Test
    void createVendor_success() {
        VendorRequestDto request = new VendorRequestDto("Acme Corp", "contact@acme.com", VendorStatus.ACTIVE);
        Vendor vendor = buildVendor(null);
        Vendor saved = buildVendor(VENDOR_ID);
        VendorResponseDto expected = buildResponseDto(VENDOR_ID);

        when(requestDtoMapper.toEntity(request)).thenReturn(vendor);
        when(vendorRepository.save(vendor)).thenReturn(saved);
        when(responseDtoMapper.toDto(saved)).thenReturn(expected);

        VendorResponseDto result = vendorService.createVendor(ACTOR_ID, request);

        assertThat(result.vendorId()).isEqualTo(VENDOR_ID);
        assertThat(result.name()).isEqualTo("Acme Corp");
        verify(vendorRepository).save(vendor);
    }

    // ─── getVendorById ────────────────────────────────────────────────────────

    @Test
    void getVendorById_found() {
        Vendor vendor = buildVendor(VENDOR_ID);
        VendorResponseDto expected = buildResponseDto(VENDOR_ID);

        when(vendorRepository.findById(VENDOR_ID)).thenReturn(Optional.of(vendor));
        when(responseDtoMapper.toDto(vendor)).thenReturn(expected);

        VendorResponseDto result = vendorService.getVendorById(ACTOR_ID, VENDOR_ID);

        assertThat(result.vendorId()).isEqualTo(VENDOR_ID);
    }

    @Test
    void getVendorById_notFound_throwsVendorNotFoundException() {
        when(vendorRepository.findById(VENDOR_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> vendorService.getVendorById(ACTOR_ID, VENDOR_ID))
                .isInstanceOf(VendorNotFoundException.class);
    }

    // ─── getAllVendors ────────────────────────────────────────────────────────

    @Test
    void getAllVendors_returnsList() {
        Vendor v1 = buildVendor("v1");
        Vendor v2 = buildVendor("v2");
        VendorResponseDto dto1 = buildResponseDto("v1");
        VendorResponseDto dto2 = buildResponseDto("v2");

        when(vendorRepository.findAll()).thenReturn(List.of(v1, v2));
        when(responseDtoMapper.toDto(v1)).thenReturn(dto1);
        when(responseDtoMapper.toDto(v2)).thenReturn(dto2);

        List<VendorResponseDto> result = vendorService.getAllVendors(ACTOR_ID);

        assertThat(result).hasSize(2);
        assertThat(result.get(0).vendorId()).isEqualTo("v1");
    }

    @Test
    void getAllVendors_empty_returnsEmptyList() {
        when(vendorRepository.findAll()).thenReturn(List.of());

        List<VendorResponseDto> result = vendorService.getAllVendors(ACTOR_ID);

        assertThat(result).isEmpty();
    }

    // ─── updateVendor ─────────────────────────────────────────────────────────

    @Test
    void updateVendor_success() {
        VendorRequestDto request = new VendorRequestDto("Updated Corp", "new@corp.com", VendorStatus.INACTIVE);
        Vendor existing = buildVendor(VENDOR_ID);
        Vendor updated = buildVendor(VENDOR_ID);
        updated.setName("Updated Corp");
        updated.setContactInfo("new@corp.com");
        updated.setStatus(VendorStatus.INACTIVE);
        VendorResponseDto expected = new VendorResponseDto(VENDOR_ID, "Updated Corp", "new@corp.com",
                VendorStatus.INACTIVE, LocalDateTime.now(), LocalDateTime.now());

        when(vendorRepository.findById(VENDOR_ID)).thenReturn(Optional.of(existing));
        when(vendorRepository.save(existing)).thenReturn(updated);
        when(responseDtoMapper.toDto(updated)).thenReturn(expected);

        VendorResponseDto result = vendorService.updateVendor(ACTOR_ID, VENDOR_ID, request);

        assertThat(result.name()).isEqualTo("Updated Corp");
        assertThat(result.status()).isEqualTo(VendorStatus.INACTIVE);
        verify(vendorRepository).save(existing);
    }

    @Test
    void updateVendor_notFound_throwsVendorNotFoundException() {
        VendorRequestDto request = new VendorRequestDto("X", "x@x.com", VendorStatus.ACTIVE);
        when(vendorRepository.findById(VENDOR_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> vendorService.updateVendor(ACTOR_ID, VENDOR_ID, request))
                .isInstanceOf(VendorNotFoundException.class);
        verify(vendorRepository, never()).save(any());
    }

    // ─── deleteVendor ─────────────────────────────────────────────────────────

    @Test
    void deleteVendor_success() {
        when(vendorRepository.existsById(VENDOR_ID)).thenReturn(true);
        doNothing().when(vendorRepository).deleteById(VENDOR_ID);

        vendorService.deleteVendor(ACTOR_ID, VENDOR_ID);

        verify(vendorRepository).deleteById(VENDOR_ID);
    }

    @Test
    void deleteVendor_notFound_throwsVendorNotFoundException() {
        when(vendorRepository.existsById(VENDOR_ID)).thenReturn(false);

        assertThatThrownBy(() -> vendorService.deleteVendor(ACTOR_ID, VENDOR_ID))
                .isInstanceOf(VendorNotFoundException.class);
        verify(vendorRepository, never()).deleteById(any());
    }
}

package com.cts.eventsphere.vendormanager.controller;

import com.cts.eventsphere.vendormanager.auth.dto.UserPrincipal;
import com.cts.eventsphere.vendormanager.dto.vendor.VendorRequestDto;
import com.cts.eventsphere.vendormanager.dto.vendor.VendorResponseDto;
import com.cts.eventsphere.vendormanager.model.data.VendorStatus;
import com.cts.eventsphere.vendormanager.service.VendorService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VendorControllerTest {

    @Mock
    private VendorService vendorService;

    @InjectMocks
    private VendorController vendorController;

    private final UserPrincipal user = new UserPrincipal("user-1", "VENDOR", List.of());

    private VendorResponseDto buildVendorResponse(String id) {
        return new VendorResponseDto(id, "TechSupplies", "tech@supplies.com", VendorStatus.ACTIVE,
                LocalDateTime.now(), LocalDateTime.now());
    }

    @Test
    void create_returns201WithBody() {
        VendorRequestDto request = new VendorRequestDto("TechSupplies", "tech@supplies.com", VendorStatus.ACTIVE);
        VendorResponseDto expected = buildVendorResponse("v-1");
        when(vendorService.createVendor("user-1", request)).thenReturn(expected);

        ResponseEntity<VendorResponseDto> response = vendorController.create(user, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isEqualTo(expected);
    }

    @Test
    void getById_returns200WithBody() {
        VendorResponseDto expected = buildVendorResponse("v-1");
        when(vendorService.getVendorById("user-1", "v-1")).thenReturn(expected);

        ResponseEntity<VendorResponseDto> response = vendorController.getById(user, "v-1");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(expected);
    }

    @Test
    void getAll_returns200WithList() {
        List<VendorResponseDto> vendors = List.of(buildVendorResponse("v-1"), buildVendorResponse("v-2"));
        when(vendorService.getAllVendors("user-1")).thenReturn(vendors);

        ResponseEntity<List<VendorResponseDto>> response = vendorController.getAll(user);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).hasSize(2);
    }

    @Test
    void update_returns200WithBody() {
        VendorRequestDto request = new VendorRequestDto("Updated", "updated@supplies.com", VendorStatus.INACTIVE);
        VendorResponseDto expected = buildVendorResponse("v-1");
        when(vendorService.updateVendor("user-1", "v-1", request)).thenReturn(expected);

        ResponseEntity<VendorResponseDto> response = vendorController.update(user, "v-1", request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(expected);
    }

    @Test
    void delete_returns204() {
        doNothing().when(vendorService).deleteVendor("user-1", "v-1");

        ResponseEntity<Void> response = vendorController.delete(user, "v-1");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        verify(vendorService).deleteVendor("user-1", "v-1");
    }
}

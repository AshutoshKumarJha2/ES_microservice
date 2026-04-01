package com.cts.eventsphere.vendormanager.controller;

import com.cts.eventsphere.vendormanager.auth.dto.UserPrincipal;
import com.cts.eventsphere.vendormanager.dto.delivery.DeliveryRequestDto;
import com.cts.eventsphere.vendormanager.dto.delivery.DeliveryResponseDto;
import com.cts.eventsphere.vendormanager.model.data.DeliveryStatus;
import com.cts.eventsphere.vendormanager.service.DeliveryService;
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
class DeliveryControllerTest {

    @Mock
    private DeliveryService deliveryService;

    @InjectMocks
    private DeliveryController deliveryController;

    private final UserPrincipal user = new UserPrincipal("user-1", "VENDOR", List.of());

    private DeliveryResponseDto buildDeliveryResponse(String id) {
        return new DeliveryResponseDto(id, "inv-1", "Tables", 10,
                LocalDateTime.now().plusDays(3), DeliveryStatus.SCHEDULED, "TRK-001",
                LocalDateTime.now(), LocalDateTime.now());
    }

    @Test
    void create_returns201() {
        DeliveryRequestDto request = new DeliveryRequestDto("inv-1", "Tables", 10,
                LocalDateTime.now().plusDays(3), DeliveryStatus.SCHEDULED, "TRK-001");
        DeliveryResponseDto expected = buildDeliveryResponse("d-1");
        when(deliveryService.createDelivery("user-1", request)).thenReturn(expected);

        ResponseEntity<DeliveryResponseDto> response = deliveryController.create(user, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isEqualTo(expected);
    }

    @Test
    void getById_returns200() {
        DeliveryResponseDto expected = buildDeliveryResponse("d-1");
        when(deliveryService.getDeliveryById("user-1", "d-1")).thenReturn(expected);

        ResponseEntity<DeliveryResponseDto> response = deliveryController.getById(user, "d-1");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(expected);
    }

    @Test
    void getAll_returns200WithList() {
        when(deliveryService.getAllDeliveries("user-1")).thenReturn(List.of(buildDeliveryResponse("d-1")));

        ResponseEntity<List<DeliveryResponseDto>> response = deliveryController.getAll(user);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).hasSize(1);
    }

    @Test
    void updateStatus_returns200() {
        DeliveryResponseDto expected = buildDeliveryResponse("d-1");
        when(deliveryService.updateDeliveryStatus("user-1", "d-1", DeliveryStatus.DELIVERED)).thenReturn(expected);

        ResponseEntity<DeliveryResponseDto> response = deliveryController.updateStatus(user, "d-1", DeliveryStatus.DELIVERED);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    void update_returns200() {
        DeliveryRequestDto request = new DeliveryRequestDto("inv-1", "Chairs", 20,
                LocalDateTime.now().plusDays(5), DeliveryStatus.IN_TRANSIT, "TRK-002");
        DeliveryResponseDto expected = buildDeliveryResponse("d-1");
        when(deliveryService.updateDelivery("user-1", "d-1", request)).thenReturn(expected);

        ResponseEntity<DeliveryResponseDto> response = deliveryController.update(user, "d-1", request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    void delete_returns204() {
        doNothing().when(deliveryService).deleteDelivery("user-1", "d-1");

        ResponseEntity<Void> response = deliveryController.delete(user, "d-1");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        verify(deliveryService).deleteDelivery("user-1", "d-1");
    }
}

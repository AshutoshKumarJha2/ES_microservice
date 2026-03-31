package com.cts.eventsphere.vendormanager.service;

import com.cts.eventsphere.vendormanager.dto.delivery.DeliveryRequestDto;
import com.cts.eventsphere.vendormanager.dto.delivery.DeliveryResponseDto;
import com.cts.eventsphere.vendormanager.dto.mapper.delivery.DeliveryRequestDtoMapper;
import com.cts.eventsphere.vendormanager.dto.mapper.delivery.DeliveryResponseDtoMapper;
import com.cts.eventsphere.vendormanager.exception.delivery.DeliveryNotFoundException;
import com.cts.eventsphere.vendormanager.model.Delivery;
import com.cts.eventsphere.vendormanager.model.data.DeliveryStatus;
import com.cts.eventsphere.vendormanager.repository.DeliveryRepository;
import com.cts.eventsphere.vendormanager.service.impl.DeliveryServiceImpl;
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
class DeliveryServiceImplTest {

    @Mock private DeliveryRepository deliveryRepository;
    @Mock private DeliveryRequestDtoMapper requestDtoMapper;
    @Mock private DeliveryResponseDtoMapper responseDtoMapper;

    @InjectMocks
    private DeliveryServiceImpl deliveryService;

    private static final String ACTOR_ID = "actor-1";
    private static final String DELIVERY_ID = "delivery-100";
    private static final String INVOICE_ID = "invoice-200";

    private Delivery buildDelivery(String id) {
        Delivery d = new Delivery();
        d.setDeliveryId(id);
        d.setInvoiceId(INVOICE_ID);
        d.setItem("Chairs");
        d.setQuantity(50);
        d.setDeliveryDate(LocalDateTime.now().plusDays(3));
        d.setStatus(DeliveryStatus.SCHEDULED);
        d.setTrackingNumber("TRK-001");
        d.setCreatedAt(LocalDateTime.now());
        d.setUpdatedAt(LocalDateTime.now());
        return d;
    }

    private DeliveryResponseDto buildResponseDto(String id, DeliveryStatus status) {
        return new DeliveryResponseDto(id, INVOICE_ID, "Chairs", 50,
                LocalDateTime.now().plusDays(3), status, "TRK-001",
                LocalDateTime.now(), LocalDateTime.now());
    }

    private DeliveryRequestDto buildRequestDto() {
        return new DeliveryRequestDto(INVOICE_ID, "Chairs", 50,
                LocalDateTime.now().plusDays(3), DeliveryStatus.SCHEDULED, "TRK-001");
    }

    // ─── createDelivery ───────────────────────────────────────────────────────

    @Test
    void createDelivery_success() {
        DeliveryRequestDto request = buildRequestDto();
        Delivery delivery = buildDelivery(null);
        Delivery saved = buildDelivery(DELIVERY_ID);
        DeliveryResponseDto expected = buildResponseDto(DELIVERY_ID, DeliveryStatus.SCHEDULED);

        when(requestDtoMapper.toEntity(request)).thenReturn(delivery);
        when(deliveryRepository.save(delivery)).thenReturn(saved);
        when(responseDtoMapper.toDto(saved)).thenReturn(expected);

        DeliveryResponseDto result = deliveryService.createDelivery(ACTOR_ID, request);

        assertThat(result.deliveryId()).isEqualTo(DELIVERY_ID);
        assertThat(result.status()).isEqualTo(DeliveryStatus.SCHEDULED);
        verify(deliveryRepository).save(delivery);
    }

    // ─── getDeliveryById ──────────────────────────────────────────────────────

    @Test
    void getDeliveryById_found() {
        Delivery delivery = buildDelivery(DELIVERY_ID);
        DeliveryResponseDto expected = buildResponseDto(DELIVERY_ID, DeliveryStatus.SCHEDULED);

        when(deliveryRepository.findById(DELIVERY_ID)).thenReturn(Optional.of(delivery));
        when(responseDtoMapper.toDto(delivery)).thenReturn(expected);

        DeliveryResponseDto result = deliveryService.getDeliveryById(ACTOR_ID, DELIVERY_ID);

        assertThat(result.deliveryId()).isEqualTo(DELIVERY_ID);
    }

    @Test
    void getDeliveryById_notFound_throwsDeliveryNotFoundException() {
        when(deliveryRepository.findById(DELIVERY_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> deliveryService.getDeliveryById(ACTOR_ID, DELIVERY_ID))
                .isInstanceOf(DeliveryNotFoundException.class);
    }

    // ─── getAllDeliveries ─────────────────────────────────────────────────────

    @Test
    void getAllDeliveries_returnsList() {
        Delivery d1 = buildDelivery("d1");
        Delivery d2 = buildDelivery("d2");
        DeliveryResponseDto dto1 = buildResponseDto("d1", DeliveryStatus.SCHEDULED);
        DeliveryResponseDto dto2 = buildResponseDto("d2", DeliveryStatus.IN_TRANSIT);

        when(deliveryRepository.findAll()).thenReturn(List.of(d1, d2));
        when(responseDtoMapper.toDto(d1)).thenReturn(dto1);
        when(responseDtoMapper.toDto(d2)).thenReturn(dto2);

        List<DeliveryResponseDto> result = deliveryService.getAllDeliveries(ACTOR_ID);

        assertThat(result).hasSize(2);
    }

    @Test
    void getAllDeliveries_empty_returnsEmptyList() {
        when(deliveryRepository.findAll()).thenReturn(List.of());

        assertThat(deliveryService.getAllDeliveries(ACTOR_ID)).isEmpty();
    }

    // ─── updateDeliveryStatus ─────────────────────────────────────────────────

    @Test
    void updateDeliveryStatus_success() {
        Delivery delivery = buildDelivery(DELIVERY_ID);
        Delivery updated = buildDelivery(DELIVERY_ID);
        updated.setStatus(DeliveryStatus.IN_TRANSIT);
        DeliveryResponseDto expected = buildResponseDto(DELIVERY_ID, DeliveryStatus.IN_TRANSIT);

        when(deliveryRepository.findById(DELIVERY_ID)).thenReturn(Optional.of(delivery));
        when(deliveryRepository.save(delivery)).thenReturn(updated);
        when(responseDtoMapper.toDto(updated)).thenReturn(expected);

        DeliveryResponseDto result = deliveryService.updateDeliveryStatus(ACTOR_ID, DELIVERY_ID, DeliveryStatus.IN_TRANSIT);

        assertThat(result.status()).isEqualTo(DeliveryStatus.IN_TRANSIT);
    }

    @Test
    void updateDeliveryStatus_notFound_throwsDeliveryNotFoundException() {
        when(deliveryRepository.findById(DELIVERY_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> deliveryService.updateDeliveryStatus(ACTOR_ID, DELIVERY_ID, DeliveryStatus.DELIVERED))
                .isInstanceOf(DeliveryNotFoundException.class);
    }

    // ─── updateDelivery ───────────────────────────────────────────────────────

    @Test
    void updateDelivery_success() {
        DeliveryRequestDto request = buildRequestDto();
        Delivery delivery = buildDelivery(DELIVERY_ID);
        Delivery updated = buildDelivery(DELIVERY_ID);
        DeliveryResponseDto expected = buildResponseDto(DELIVERY_ID, DeliveryStatus.SCHEDULED);

        when(deliveryRepository.findById(DELIVERY_ID)).thenReturn(Optional.of(delivery));
        when(deliveryRepository.save(delivery)).thenReturn(updated);
        when(responseDtoMapper.toDto(updated)).thenReturn(expected);

        DeliveryResponseDto result = deliveryService.updateDelivery(ACTOR_ID, DELIVERY_ID, request);

        assertThat(result).isNotNull();
        verify(deliveryRepository).save(delivery);
    }

    @Test
    void updateDelivery_notFound_throwsDeliveryNotFoundException() {
        DeliveryRequestDto request = buildRequestDto();
        when(deliveryRepository.findById(DELIVERY_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> deliveryService.updateDelivery(ACTOR_ID, DELIVERY_ID, request))
                .isInstanceOf(DeliveryNotFoundException.class);
    }

    // ─── deleteDelivery ───────────────────────────────────────────────────────

    @Test
    void deleteDelivery_success() {
        when(deliveryRepository.existsById(DELIVERY_ID)).thenReturn(true);
        doNothing().when(deliveryRepository).deleteById(DELIVERY_ID);

        deliveryService.deleteDelivery(ACTOR_ID, DELIVERY_ID);

        verify(deliveryRepository).deleteById(DELIVERY_ID);
    }

    @Test
    void deleteDelivery_notFound_throwsDeliveryNotFoundException() {
        when(deliveryRepository.existsById(DELIVERY_ID)).thenReturn(false);

        assertThatThrownBy(() -> deliveryService.deleteDelivery(ACTOR_ID, DELIVERY_ID))
                .isInstanceOf(DeliveryNotFoundException.class);
        verify(deliveryRepository, never()).deleteById(any());
    }
}

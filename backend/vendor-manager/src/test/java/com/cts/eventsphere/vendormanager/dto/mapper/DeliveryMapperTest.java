package com.cts.eventsphere.vendormanager.dto.mapper;

import com.cts.eventsphere.vendormanager.dto.delivery.DeliveryRequestDto;
import com.cts.eventsphere.vendormanager.dto.delivery.DeliveryResponseDto;
import com.cts.eventsphere.vendormanager.dto.mapper.delivery.DeliveryRequestDtoMapper;
import com.cts.eventsphere.vendormanager.dto.mapper.delivery.DeliveryResponseDtoMapper;
import com.cts.eventsphere.vendormanager.model.Delivery;
import com.cts.eventsphere.vendormanager.model.data.DeliveryStatus;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class DeliveryMapperTest {

    private final DeliveryRequestDtoMapper requestMapper = new DeliveryRequestDtoMapper();
    private final DeliveryResponseDtoMapper responseMapper = new DeliveryResponseDtoMapper();

    @Test
    void requestMapper_toEntity_mapsAllFields() {
        LocalDateTime deliveryDate = LocalDateTime.now().plusDays(5);
        DeliveryRequestDto dto = new DeliveryRequestDto("inv-1", "Tables", 10, deliveryDate, DeliveryStatus.SCHEDULED, "TRK-001");

        Delivery result = requestMapper.toEntity(dto);

        assertThat(result.getInvoiceId()).isEqualTo("inv-1");
        assertThat(result.getItem()).isEqualTo("Tables");
        assertThat(result.getQuantity()).isEqualTo(10);
        assertThat(result.getDeliveryDate()).isEqualTo(deliveryDate);
        assertThat(result.getStatus()).isEqualTo(DeliveryStatus.SCHEDULED);
        assertThat(result.getTrackingNumber()).isEqualTo("TRK-001");
    }

    @Test
    void requestMapper_toEntity_nullInput_returnsNull() {
        assertThat(requestMapper.toEntity(null)).isNull();
    }

    @Test
    void responseMapper_toDto_mapsAllFields() {
        LocalDateTime now = LocalDateTime.now();
        Delivery delivery = new Delivery();
        delivery.setDeliveryId("d-1");
        delivery.setInvoiceId("inv-1");
        delivery.setItem("Chairs");
        delivery.setQuantity(50);
        delivery.setDeliveryDate(now.plusDays(3));
        delivery.setStatus(DeliveryStatus.IN_TRANSIT);
        delivery.setTrackingNumber("TRK-999");
        delivery.setCreatedAt(now);
        delivery.setUpdatedAt(now);

        DeliveryResponseDto result = responseMapper.toDto(delivery);

        assertThat(result.deliveryId()).isEqualTo("d-1");
        assertThat(result.invoiceId()).isEqualTo("inv-1");
        assertThat(result.item()).isEqualTo("Chairs");
        assertThat(result.quantity()).isEqualTo(50);
        assertThat(result.deliveryDate()).isEqualTo(now.plusDays(3));
        assertThat(result.status()).isEqualTo(DeliveryStatus.IN_TRANSIT);
        assertThat(result.trackingNumber()).isEqualTo("TRK-999");
        assertThat(result.createdAt()).isEqualTo(now);
        assertThat(result.updatedAt()).isEqualTo(now);
    }

    @Test
    void responseMapper_toDto_nullInput_returnsNull() {
        assertThat(responseMapper.toDto(null)).isNull();
    }
}

package com.cts.eventsphere.vendormanager.dto.mapper.delivery;

import com.cts.eventsphere.vendormanager.dto.delivery.DeliveryResponseDto;
import com.cts.eventsphere.vendormanager.model.Delivery;
import org.springframework.stereotype.Component;

/**
 * Mapper to convert Delivery Entity to DeliveryResponseDto.
 *
 * @author 2480177
 * @version 1.0
 * @since 02-03-2026
 */

@Component
public class DeliveryResponseDtoMapper {

    /**
     * Maps Delivery Entity to Response DTO.
     * * @param delivery the delivery entity from the database
     * @return a DeliveryResponseDto record populated with entity data
     */
    public DeliveryResponseDto toDto(Delivery delivery){
        if (delivery == null) {
            return null;
        }
        return new DeliveryResponseDto(
                delivery.getDeliveryId(),
                delivery.getInvoiceId(),
                delivery.getItem(),
                delivery.getQuantity(),
                delivery.getDeliveryDate(),
                delivery.getStatus(),
                delivery.getTrackingNumber(),
                delivery.getCreatedAt(),
                delivery.getUpdatedAt()
        );
    }
}

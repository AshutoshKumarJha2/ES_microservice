package com.cts.eventsphere.vendormanager.dto.mapper.delivery;

import com.cts.eventsphere.vendormanager.dto.delivery.DeliveryRequestDto;
import com.cts.eventsphere.vendormanager.model.Delivery;
import org.springframework.stereotype.Component;

/**
 * Mapper to convert DeliveryRequestDto to Delivery Entity.
 *
 * @author 2480177
 * @version 1.0
 * @since 02-03-2026
 */

@Component
public class DeliveryRequestDtoMapper {

    /**
     * Maps Request DTO to Delivery Entity.
     *
     * @param dto the delivery request data
     * @return a Delivery entity populated with DTO data
     */
    public Delivery toEntity(DeliveryRequestDto dto){
        if (dto == null) {
            return null;
        }
        Delivery delivery = new Delivery();
        delivery.setInvoiceId(dto.invoiceId());
        delivery.setItem(dto.item());
        delivery.setQuantity(dto.quantity());
        delivery.setDeliveryDate(dto.deliveryDate());
        delivery.setStatus(dto.status());
        delivery.setTrackingNumber(dto.trackingNumber());
        return delivery;
    }
}

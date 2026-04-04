package com.cts.eventsphere.vendormanager.service;

import com.cts.eventsphere.vendormanager.dto.delivery.DeliveryRequestDto;
import com.cts.eventsphere.vendormanager.dto.delivery.DeliveryResponseDto;
import com.cts.eventsphere.vendormanager.model.data.DeliveryStatus;

import java.util.List;

/**
 * Service interface for Delivery operations.
 * Handles tracking of goods, equipment, and resources for events.
 * * @author 2480177
 * @version 1.0
 * @since 03-03-2026
 */

public interface DeliveryService {
    /**
     * Creates a new delivery record and associates it with an invoice.
     * @param request the delivery details provided by the vendor
     * @return the created delivery response DTO
     */
    DeliveryResponseDto createDelivery(String actorId, DeliveryRequestDto request);

    /**
     * Retrieves delivery details by its unique identifier.
     * @param deliveryId the unique ID of the delivery record
     * @return the delivery response DTO
     */
    DeliveryResponseDto getDeliveryById(String actorId, String deliveryId);

    /**
     * Retrieves all delivery entries from the system.
     * @return a list of all delivery response DTOs
     */
    List<DeliveryResponseDto> getAllDeliveries(String actorId);

    /**
     * Updates the status of an existing delivery.
     * @param deliveryId the ID of the delivery record
     * @param status the new status to apply
     * @return the updated delivery response DTO
     */
    DeliveryResponseDto updateDeliveryStatus(String actorId, String deliveryId, DeliveryStatus status);

    /**
     * Updates all details of an existing delivery record.
     * @param deliveryId the ID of the delivery record
     * @param request the updated delivery data
     * @return the updated delivery response DTO
     */
    DeliveryResponseDto updateDelivery(String actorId, String deliveryId, DeliveryRequestDto request);

    /**
     * Removes a delivery record from the system.
     * @param deliveryId the unique ID of the delivery to delete
     */
    void deleteDelivery(String actorId, String deliveryId);
}

package com.cts.eventsphere.vendormanager.service.impl;


import com.cts.eventsphere.vendormanager.dto.delivery.DeliveryRequestDto;
import com.cts.eventsphere.vendormanager.dto.delivery.DeliveryResponseDto;
import com.cts.eventsphere.vendormanager.dto.mapper.delivery.DeliveryRequestDtoMapper;
import com.cts.eventsphere.vendormanager.dto.mapper.delivery.DeliveryResponseDtoMapper;
import com.cts.eventsphere.vendormanager.exception.delivery.DeliveryNotFoundException;
import com.cts.eventsphere.vendormanager.model.Delivery;
import com.cts.eventsphere.vendormanager.model.data.DeliveryStatus;
import com.cts.eventsphere.vendormanager.repository.DeliveryRepository;
import com.cts.eventsphere.vendormanager.service.DeliveryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service Implementation for Delivery operations.
 * Manages logistical tracking and status updates for physical goods and equipment.
 *
 * @author 2480177
 * @version 1.1
 * @since 03-03-2026
 */

@Service
@RequiredArgsConstructor
@Slf4j
public class DeliveryServiceImpl implements DeliveryService {

    private final DeliveryRepository deliveryRepository;
    private final DeliveryRequestDtoMapper requestDtoMapper;
    private final DeliveryResponseDtoMapper responseDtoMapper;
//    private final AuditService auditService;
//    private final NotificationService notificationService;

    /**
     * Creates a new delivery record and persists it to the database.
     *
     * @param request the delivery details provided by the vendor
     * @return the created delivery details as a response DTO
     */
    @Override
    @Transactional
    public DeliveryResponseDto createDelivery(String actorId, DeliveryRequestDto request){
        log.info("Attempting to create a new delivery for invoice ID: {} by actorId={}", request.invoiceId(), actorId);
        Delivery delivery = requestDtoMapper.toEntity(request);
        Delivery saved = deliveryRepository.save(delivery);
        log.info("Successfully created delivery with ID: {} by actorId={}", saved.getDeliveryId(),actorId);
//        auditService.logAudit(
//                actorId,
//                AuditAction.CREATE,
//                Delivery.class,
//                saved.getDeliveryId()
//        );
//
//        notificationService.sendNotification(
//                actorId,
//                "Delivery created for Invoice ID: " + request.invoiceId(),
//                "DELIVERY_CREATED"
//        );

        return responseDtoMapper.toDto(saved);
    }

    /**
     * Retrieves a specific delivery record by its unique identifier.
     *
     * @param deliveryId the unique ID of the delivery to fetch
     * @return the delivery details as a response DTO
     * @throws DeliveryNotFoundException if the delivery ID is not found in the database
     */
    @Override
    public DeliveryResponseDto getDeliveryById(String actorId, String deliveryId){
        log.info("Fetching delivery details for ID: {} by actorId={}", deliveryId, actorId);

        Delivery delivery = deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new DeliveryNotFoundException(deliveryId));
//        auditService.logAudit(
//                actorId,
//                AuditAction.READ,
//                Delivery.class,
//                deliveryId
//        );
        return responseDtoMapper.toDto(delivery);
    }

    /**
     * Fetches all deliveries in the system.
     *
     * @return list of all delivery response DTOs
     */
    @Override
    public List<DeliveryResponseDto> getAllDeliveries(String actorId){
        log.info("Fetching all deliveries from database by actorId={}",actorId);
        return deliveryRepository.findAll()
                .stream()
//                .peek(d ->
//                        auditService.logAudit(
//                                actorId,
//                                AuditAction.READ,
//                                Delivery.class,
//                                d.getDeliveryId()
//                        )
//                )
                .map(responseDtoMapper::toDto)
                .toList();
    }

    /**
     * Updates the status of an existing delivery record.
     * Useful for progressing a delivery from scheduled to in-transit or delivered.
     *
     * @param deliveryId the unique identifier of the delivery
     * @param status the new DeliveryStatus to apply
     * @return the updated delivery details
     * @throws DeliveryNotFoundException if the delivery record does not exist
     */
    @Override
    @Transactional
    public DeliveryResponseDto updateDeliveryStatus(String actorId, String deliveryId, DeliveryStatus status) {
        log.info("Attempting to update status for delivery ID: {} to {} by actorId={}", deliveryId, status, actorId);
        Delivery delivery = deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new DeliveryNotFoundException(deliveryId));

        delivery.setStatus(status);
        Delivery updated = deliveryRepository.save(delivery);
        log.info("Successfully updated status for delivery ID: {} by actorId={}", deliveryId, actorId);
//        auditService.logAudit(
//                actorId,
//                AuditAction.UPDATE,
//                Delivery.class,
//                deliveryId
//        );
//
//        notificationService.sendNotification(
//                actorId,
//                "Delivery status updated to " + status +
//                        ". Delivery ID: " + deliveryId,
//                "DELIVERY_STATUS_UPDATED"
//        );

        return responseDtoMapper.toDto(updated);
    }

    /**
     * Performs a full update of an existing delivery's details.
     *
     * @param deliveryId the unique identifier of the delivery to update
     * @param request the updated delivery details provided via DTO
     * @return the updated delivery response DTO
     * @throws DeliveryNotFoundException if the delivery ID is not found
     */
    @Override
    @Transactional
    public DeliveryResponseDto updateDelivery(String actorId, String deliveryId, DeliveryRequestDto request){
        log.info("Attempting to update details for delivery ID: {} by actorId={}", deliveryId, actorId);

        Delivery delivery = deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new DeliveryNotFoundException(deliveryId));

        delivery.setInvoiceId(request.invoiceId());
        delivery.setItem(request.item());
        delivery.setQuantity(request.quantity());
        delivery.setDeliveryDate(request.deliveryDate());
        delivery.setStatus(request.status());
        delivery.setTrackingNumber(request.trackingNumber());

        Delivery updated = deliveryRepository.save(delivery);
        log.info("Successfully updated details for delivery ID: {} by actorId={}", deliveryId, actorId);
//        auditService.logAudit(
//                actorId,
//                AuditAction.UPDATE,
//                Delivery.class,
//                deliveryId
//        );
//
//        notificationService.sendNotification(
//                actorId,
//                "Delivery details updated. Delivery ID: " + deliveryId,
//                "DELIVERY_UPDATED"
//        );

        return responseDtoMapper.toDto(updated);
    }

    /**
     * Removes a delivery record from the system based on the provided ID.
     *
     * @param deliveryId the unique identifier of the delivery to delete
     * @throws DeliveryNotFoundException if the delivery record is not found
     */
    @Override
    @Transactional
    public void deleteDelivery(String actorId, String deliveryId){
        log.info("Attempting to delete delivery ID: {} by actorId={}", deliveryId, actorId);

        if(!deliveryRepository.existsById(deliveryId)){
            throw new DeliveryNotFoundException(deliveryId);
        }

        deliveryRepository.deleteById(deliveryId);
        log.info("Successfully deleted delivery ID: {} by actorId={}", deliveryId, actorId);
//        auditService.logAudit(
//                actorId,
//                AuditAction.DELETE,
//                Delivery.class,
//                deliveryId
//        );
//
//        notificationService.sendNotification(
//                actorId,
//                "Delivery deleted. Delivery ID: " + deliveryId,
//                "DELIVERY_DELETED"
//        );
    }
}

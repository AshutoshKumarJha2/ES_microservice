package com.cts.eventsphere.vendormanager.controller;

import com.cts.eventsphere.vendormanager.auth.dto.UserPrincipal;
import com.cts.eventsphere.vendormanager.dto.delivery.DeliveryRequestDto;
import com.cts.eventsphere.vendormanager.dto.delivery.DeliveryResponseDto;
import com.cts.eventsphere.vendormanager.exception.delivery.DeliveryNotFoundException;
import com.cts.eventsphere.vendormanager.model.data.DeliveryStatus;
import com.cts.eventsphere.vendormanager.service.DeliveryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Rest Controller for Delivery entity management.
 * Provides endpoints for tracking equipment and resource deliveries for events.
 * Adheres to mandatory coding standards for maintainability and readability.
 *
 * @author 2480177
 * @version 1.1
 * @since 03-03-2026
 */

@RestController
@RequestMapping("/api/v1/deliveries")
@RequiredArgsConstructor
@Slf4j
@Validated
public class DeliveryController {

    private final DeliveryService deliveryService;

    /**
     * Creates a new delivery record in the system.
     * This endpoint is restricted to users with the 'VENDOR' role.
     *
     * @param user The currently authenticated user's details representing the actor.
     * @param request the delivery details to be created, validated by @Valid
     * @return the created delivery response DTO with 201 Created status
     */
    @PostMapping
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<DeliveryResponseDto> create(@AuthenticationPrincipal UserPrincipal user, @Valid @RequestBody DeliveryRequestDto request) {
        var actorId = user.userId();
        log.info("REST request to create delivery for invoice: {} by actorId={}", request.invoiceId(), actorId);
        return new ResponseEntity<>(deliveryService.createDelivery(user.userId(),request), HttpStatus.CREATED);
    }

    /**
     * Retrieves a delivery record by its unique ID.
     * Returns a 200 OK status with the delivery details if found.
     *
     * @param user The currently authenticated user's details representing the actor.
     * @param id the unique identifier of the delivery
     * @return the delivery details wrapped in a ResponseEntity
     * @throws DeliveryNotFoundException if the provided delivery ID does not exist in the system
     */
    @GetMapping("/{id}")
    public ResponseEntity<DeliveryResponseDto> getById(@AuthenticationPrincipal UserPrincipal user,@PathVariable String id) {
        var actorId = user.userId();
        log.info("REST request to fetch delivery with ID: {} by actorId={}", id, actorId);
        return ResponseEntity.ok(deliveryService.getDeliveryById(user.userId(),id));
    }

    /**
     * Fetches a list of all deliveries currently registered in the system.
     * Useful for administrative overview or tracking multiple shipments.
     *
     * @param user The currently authenticated user's details representing the actor.
     * @return a list of all delivery response DTOs wrapped in a ResponseEntity
     */
    @GetMapping
    public ResponseEntity<List<DeliveryResponseDto>> getAll(@AuthenticationPrincipal UserPrincipal user) {
        var actorId = user.userId();
        log.info("REST request to fetch all deliveries by actorId={}", actorId);
        return ResponseEntity.ok(deliveryService.getAllDeliveries(user.userId()));
    }

    /**
     * Updates the status of an existing delivery.
     * Restricted to users with the 'VENDOR' role to track shipping progress.
     *
     * @param user The currently authenticated user's details representing the actor.
     * @param id the unique identifier of the delivery to be updated
     * @param status the new status (e.g., SHIPPED, DELIVERED) to apply
     * @return the updated delivery details wrapped in a ResponseEntity
     * @throws DeliveryNotFoundException if the specified delivery ID is not found
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<DeliveryResponseDto> updateStatus(
            @AuthenticationPrincipal UserPrincipal user,
            @PathVariable String id,
            @RequestParam DeliveryStatus status) {

        var actorId = user.userId();
        log.info("REST request to update status for delivery ID: {} to {} by actorId={}", id, status, actorId);
        return ResponseEntity.ok(deliveryService.updateDeliveryStatus(user.userId(),id, status));
    }

    /**
     * Performs a full update of an existing delivery record.
     * Overwrites all delivery fields with the information provided in the request body.
     * Restricted to users with the 'VENDOR' role.
     *
     * @param user The currently authenticated user's details representing the actor.
     * @param id the unique identifier of the delivery to update
     * @param request the new details (DTO) to be saved
     * @return the updated delivery response DTO wrapped in a ResponseEntity
     * @throws DeliveryNotFoundException if the specified delivery ID is not found
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<DeliveryResponseDto> update(
            @AuthenticationPrincipal UserPrincipal user,
            @PathVariable String id,
            @Valid @RequestBody DeliveryRequestDto request) {

        var actorId = user.userId();
        log.info("REST request to update full details for delivery ID: {} by actorId={}", id, actorId);
        return ResponseEntity.ok(deliveryService.updateDelivery(user.userId(),id, request));
    }

    /**
     * Permanently deletes a delivery record from the database.
     * This operation is restricted to 'VENDOR' and 'ADMIN' roles.
     *
     * @param user The currently authenticated user's details representing the actor.
     * @param id the unique identifier of the delivery to remove
     * @return an empty ResponseEntity with 204 No Content status on success
     * @throws DeliveryNotFoundException if the delivery ID is not found in the database
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('VENDOR','ADMIN')")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal UserPrincipal user,@PathVariable String id) {
        var actorId = user.userId();
        log.info("REST request to delete delivery with ID: {} by actorId={}", id, actorId);
        deliveryService.deleteDelivery(user.userId(),id);
        return ResponseEntity.noContent().build();
    }
}



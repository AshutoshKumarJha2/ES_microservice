package com.cts.eventsphere.vendormanager.dto.delivery;

import com.cts.eventsphere.vendormanager.model.data.DeliveryStatus;
import jakarta.validation.constraints.*;

import java.time.LocalDateTime;

public record DeliveryResponseDto(
        @NotBlank(message = "Response Error: Delivery ID is missing")
        String deliveryId,

        @NotBlank(message = "Response Error: Invoice ID is missing")
        String invoiceId,

        @NotBlank(message = "Response Error: Item description is missing")
        String item,

        @NotNull(message = "Response Error: Quantity is missing")
        @Min(value = 1, message = "Response Error: Quantity must be at least 1")
        Integer quantity,

        @NotNull(message = "Response Error: Delivery date is missing")
        LocalDateTime deliveryDate,

        @NotNull(message = "Response Error: Delivery status is missing")
        DeliveryStatus status,

        @NotBlank(message = "Response Error: Tracking number is missing")
        String trackingNumber,

        @NotNull(message = "Response Error: Created timestamp is missing")
        LocalDateTime createdAt,

        @NotNull(message = "Response Error: Updated timestamp is missing")
        LocalDateTime updatedAt
) {
}

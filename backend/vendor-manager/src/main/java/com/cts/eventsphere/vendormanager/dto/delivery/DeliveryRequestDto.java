package com.cts.eventsphere.vendormanager.dto.delivery;

import com.cts.eventsphere.vendormanager.model.data.DeliveryStatus;
import jakarta.validation.constraints.*;

import java.time.LocalDateTime;

public record DeliveryRequestDto(
        @NotBlank(message = "Delivery must be linked to an Invoice ID")
        String invoiceId,

        @NotBlank(message = "Item description is required")
        String item,

        @NotNull(message = "Item quantity is required")
        @Min(value = 1, message = "Quantity must be at least 1 unit")
        Integer quantity,

        @NotNull(message = "Delivery schedule date is required")
        LocalDateTime deliveryDate,

        @NotNull(message = "Delivery status is required")
        DeliveryStatus status,

        @NotBlank(message = "Tracking number must be provided")
        String trackingNumber
) {
}

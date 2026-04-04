package com.cts.eventsphere.vendormanager.dto.invoice;

import com.cts.eventsphere.vendormanager.model.data.InvoiceStatus;
import jakarta.validation.constraints.*;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Builder
public record InvoiceRequestDto(
        @NotBlank(message = "Invoices must be associated with a Contract ID")
        String contractId,

        @NotNull(message = "Invoice amount is required")
        @PositiveOrZero(message = "Invoice amount cannot be negative")
        BigDecimal totalAmount,

        @NotNull(message = "Payment due date is required")
        @FutureOrPresent(message = "Due date cannot be in the past")
        LocalDateTime dueDate,

        @NotNull(message = "Initial invoice status is required")
        InvoiceStatus status,

        String transactionId
) {
}

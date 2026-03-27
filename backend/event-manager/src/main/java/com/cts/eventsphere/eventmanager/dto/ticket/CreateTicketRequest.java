package com.cts.eventsphere.eventmanager.dto.ticket;

import com.cts.eventsphere.eventmanager.model.data.TicketStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Request DTO for creating or updating a ticket.
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 2026-03-26
 */
public record CreateTicketRequest(

        @NotBlank(message = "Ticket type must not be blank")
        @Size(max = 50, message = "Ticket type must not exceed 50 characters")
        String type,

        @NotNull(message = "Ticket price is required")
        @DecimalMin(value = "0.0", inclusive = false, message = "Ticket price must be greater than 0")
        @Digits(integer = 8, fraction = 2, message = "Ticket price must have at most 8 integer digits and 2 decimal places")
        Double price,

        @NotNull(message = "Ticket status is required")
        TicketStatus status

) {
}
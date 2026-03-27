package com.cts.eventsphere.eventmanager.dto.ticket;

import com.cts.eventsphere.eventmanager.model.data.TicketStatus;
import jakarta.validation.constraints.NotNull;

/**
 * Request DTO for creating or updating a ticket.
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 2026-03-26
 */

public record CreateTicketRequest(
        @NotNull(message = "Ticket type is required")
        String type,

        @NotNull(message = "Ticket price is required")
        double price,

        TicketStatus status
) {
}

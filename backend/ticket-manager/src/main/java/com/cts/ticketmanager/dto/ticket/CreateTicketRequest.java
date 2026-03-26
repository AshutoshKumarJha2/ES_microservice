package com.cts.ticketmanager.dto.ticket;

import com.cts.eventsphere.model.data.TicketStatus;
import jakarta.validation.constraints.NotNull;

/**
 * DTO object for creating ticket request
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 2026-03-05
 */
public record CreateTicketRequest(
        @NotNull(message = "Ticket type is required")
        String type,

        @NotNull(message = "Ticket price is required")
        double price,

        TicketStatus status
    ) {
    
}

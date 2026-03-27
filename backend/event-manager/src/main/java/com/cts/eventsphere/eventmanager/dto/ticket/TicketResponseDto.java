package com.cts.eventsphere.eventmanager.dto.ticket;

import com.cts.eventsphere.eventmanager.model.data.TicketStatus;

/**
 * Response DTO representing a single ticket.
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 2026-03-26
 */

public record TicketResponseDto(
        String ticketId,
        String eventId,
        String type,
        double price,
        TicketStatus status
) {
}

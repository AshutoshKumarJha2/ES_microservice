package com.cts.ticketmanager.dto.ticket;


import com.cts.ticketmanager.models.data.TicketStatus;

/**
 * DTO object for ticket response
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 2026-03-05
 */
public record TicketResponseDTO(
        String ticketId,
        String eventId,
        String type,
        double price,
        TicketStatus status
) {
    
}

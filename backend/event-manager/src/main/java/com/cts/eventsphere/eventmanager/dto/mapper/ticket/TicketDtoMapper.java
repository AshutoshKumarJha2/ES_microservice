package com.cts.eventsphere.eventmanager.dto.mapper.ticket;

import com.cts.eventsphere.eventmanager.dto.ticket.TicketResponseDto;
import com.cts.eventsphere.eventmanager.model.Ticket;

/**
 * Utility class for mapping {@link Ticket} entities to DTOs.
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 2026-03-26
 */

public class TicketDtoMapper {

    public static TicketResponseDto toDto(Ticket ticket) {
        return new TicketResponseDto(
                ticket.getTicketId(),
                ticket.getEvent().getEventId(),
                ticket.getType(),
                ticket.getPrice().doubleValue(),
                ticket.getStatus()
        );
    }
}

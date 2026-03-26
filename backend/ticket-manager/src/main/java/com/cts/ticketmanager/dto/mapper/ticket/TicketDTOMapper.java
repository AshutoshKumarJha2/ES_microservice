package com.cts.ticketmanager.dto.mapper.ticket;


import com.cts.ticketmanager.dto.ticket.TicketResponseDTO;
import com.cts.ticketmanager.models.Ticket;

public class TicketDTOMapper {
    public static TicketResponseDTO toDTO(Ticket ticket) {
        return new TicketResponseDTO(
                ticket.getTicketId(),
                ticket.getEventId(),
                ticket.getType(),
                ticket.getPrice().doubleValue(),
                ticket.getStatus()
        );
    }
}

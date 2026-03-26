package com.cts.ticketmanager.dto.ticket;

import java.util.List;

/**
 * DTO object for returning list of response in pagation
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 2026-03-05
 */
public record TicketListResponseDTO(
        List<TicketResponseDTO> tickets,
        int page,
        int size,
        long totalElements,
        int totalPages
) {
}

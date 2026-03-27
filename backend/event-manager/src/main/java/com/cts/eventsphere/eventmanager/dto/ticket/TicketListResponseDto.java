package com.cts.eventsphere.eventmanager.dto.ticket;

import java.util.List;

/**
 * Paginated response DTO for a list of tickets.
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 2026-03-26
 */

public record TicketListResponseDto(
        List<TicketResponseDto> tickets,
        int page,
        int size,
        long totalElements,
        int totalPages
) {
}

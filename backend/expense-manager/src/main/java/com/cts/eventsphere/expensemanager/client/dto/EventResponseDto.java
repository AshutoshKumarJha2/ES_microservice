package com.cts.eventsphere.expensemanager.client.dto;

import java.time.LocalDateTime;

/**
 * Local copy of the Event Service's response DTO.
 * Used by {@link com.cts.eventsphere.expensemanager.client.EventServiceClient}
 * to deserialize event data. Only the fields Finance Service actually needs
 * are included; additional fields are ignored by Jackson automatically.
 *
 * @author 2480081
 * @version 1.0
 * @since 25-03-2026
 */
public record EventResponseDto(
        String eventId,
        String name,
        String organizerId,
        LocalDateTime startDate,
        LocalDateTime endDate,
        String venueId,
        String status
) {}

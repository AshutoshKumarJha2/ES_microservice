package com.cts.eventsphere.vendormanager.dto.event;

import com.cts.eventsphere.vendormanager.model.data.EventStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * DTO for Event Entity.
 * * @author 2479623
 *
 * @version 1.0
 * @since 26-02-2026
 */
public record EventResponseDto(
        @NotBlank(message = "Event ID must not be blank")
        String id,

        @NotBlank(message = "Event name must not be blank")
        String eventName,

        @NotBlank(message = "Organizer ID must not be blank")
        String organizerId,

        @NotBlank(message = "Start time must not be blank")
        String startAt,

        @NotBlank(message = "End time must not be blank")
        String endAt,

        @NotNull(message = "Event status must not be null")
        EventStatus status,

        @NotBlank(message = "Venue ID must not be blank")
        String venueId
) {
}

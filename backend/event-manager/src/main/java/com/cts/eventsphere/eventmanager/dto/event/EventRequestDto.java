package com.cts.eventsphere.eventmanager.dto.event;

import com.cts.eventsphere.eventmanager.model.data.EventStatus;
import jakarta.validation.constraints.*;
import lombok.Builder;

import java.time.LocalDate;

/**
 * DTO for Request of Event.
 * * @author 2479623
 *
 * @version 1.0
 * @since 26-03-2026
 */
@Builder
public record EventRequestDto(
        @NotBlank(message = "Event name must not be blank")
        @Size(max = 100, message = "Event name must not exceed 100 characters")
        String name,

        @NotBlank(message = "Organizer ID must not be blank")
        String organizerId,

        @NotNull(message = "Start date must not be null")
        @FutureOrPresent(message = "Start date must be in the present or future")
        LocalDate startDate,

        @NotNull(message = "End date must not be null")
        @Future(message = "End date must be in the future")
        LocalDate endDate,

        String venueId,

        EventStatus status
) {
}
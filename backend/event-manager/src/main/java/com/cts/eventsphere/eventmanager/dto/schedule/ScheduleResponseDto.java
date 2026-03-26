package com.cts.eventsphere.eventmanager.dto.schedule;

import com.cts.eventsphere.eventmanager.model.data.ScheduleStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;


/**
 * DTO for Schedule Entity.
 * * @author 2479623
 *
 * @version 1.0
 * @since 26-03-2026
 */
@Builder
public record ScheduleResponseDto(
        @NotBlank(message = "Schedule ID must not be blank")
        String scheduleId,

        @NotBlank(message = "Event ID must not be blank")
        String eventId,

        @NotBlank(message = "Date must not be blank")
        String date,

        @NotBlank(message = "Time slot must not be blank")
        String timeSlot,

        @NotBlank(message = "Activity must not be blank")
        String activity,

        @NotNull(message = "Schedule status must not be null")
        ScheduleStatus status
) {
}
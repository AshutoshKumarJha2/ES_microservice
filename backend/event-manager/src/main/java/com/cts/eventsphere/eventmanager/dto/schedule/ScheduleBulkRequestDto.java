package com.cts.eventsphere.eventmanager.dto.schedule;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

/**
 * DTO for bulk schedule retrieval by IDs.
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 13-04-2026
 */
public record ScheduleBulkRequestDto(
        @NotEmpty(message = "IDs list must not be empty")
        @Size(max = 100, message = "Cannot request more than 100 schedules at once")
        List<String> ids
) {}

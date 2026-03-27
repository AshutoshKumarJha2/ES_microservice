package com.cts.eventsphere.eventmanager.dto.registration;

import java.util.List;

/**
 * Paginated response DTO for a list of registrations.
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 2026-03-26
 */

public record RegistrationListResponseDto(
        List<RegistrationDto> registrations,
        int page,
        int size,
        long totalElements,
        int totalPages
) {
}

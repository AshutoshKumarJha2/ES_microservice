package com.cts.ticketmanager.dto.registration;

import lombok.Builder;

/**
 * DTO object for registration response
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 2026-03-05
 */
@Builder
public record RegistrationDTO(
        String registrationId,
        String eventId,
        String ticketId,
        String attendeeId,
        String name,
        String email,
        String phone,
        String status
) {
}

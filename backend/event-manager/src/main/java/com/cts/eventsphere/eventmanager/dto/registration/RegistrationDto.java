package com.cts.eventsphere.eventmanager.dto.registration;

import com.cts.eventsphere.eventmanager.dto.user.UserDetailsDto;
import lombok.Builder;

/**
 * Response DTO representing a single registration.
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 2026-03-26
 */

@Builder
public record RegistrationDto(
        String registrationId,
        String eventId,
        String ticketId,
        String attendeeId,
        String status,
        UserDetailsDto attendeeDetails
) {
}

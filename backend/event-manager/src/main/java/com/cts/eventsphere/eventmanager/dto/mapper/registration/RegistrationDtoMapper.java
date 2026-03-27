package com.cts.eventsphere.eventmanager.dto.mapper.registration;

import com.cts.eventsphere.eventmanager.dto.registration.RegistrationDto;
import com.cts.eventsphere.eventmanager.model.Registration;

/**
 * Utility class for mapping {@link Registration} entities to DTOs.
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 2026-03-26
 */

public class RegistrationDtoMapper {

    public static RegistrationDto toDto(Registration registration) {
        return RegistrationDto.builder()
                .registrationId(registration.getRegistrationId())
                .eventId(registration.getEvent().getEventId())
                .ticketId(registration.getTicket().getTicketId())
                .attendeeId(registration.getAttendeeId())
                .status(registration.getStatus().name())
                .build();
    }
}

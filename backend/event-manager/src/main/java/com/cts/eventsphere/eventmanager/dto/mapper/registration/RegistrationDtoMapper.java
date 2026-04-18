package com.cts.eventsphere.eventmanager.dto.mapper.registration;

import com.cts.eventsphere.eventmanager.dto.registration.RegistrationDto;
import com.cts.eventsphere.eventmanager.dto.user.UserDetailsDto;
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
        var ticket = registration.getTicket();
        return RegistrationDto.builder()
                .registrationId(registration.getRegistrationId())
                .eventId(registration.getEvent().getEventId())
                .ticketId(ticket != null ? ticket.getTicketId() : null)
                .ticketType(ticket != null ? ticket.getType() : null)
                .ticketPrice(ticket != null && ticket.getPrice() != null ? ticket.getPrice().doubleValue() : null)
                .attendeeId(registration.getAttendeeId())
                .status(registration.getStatus().name())
                .build();
    }

    public static RegistrationDto toDto(Registration registration, UserDetailsDto userDetails) {
        var ticket = registration.getTicket();
        return RegistrationDto.builder()
                .registrationId(registration.getRegistrationId())
                .eventId(registration.getEvent().getEventId())
                .ticketId(ticket != null ? ticket.getTicketId() : null)
                .ticketType(ticket != null ? ticket.getType() : null)
                .ticketPrice(ticket != null && ticket.getPrice() != null ? ticket.getPrice().doubleValue() : null)
                .attendeeId(registration.getAttendeeId())
                .status(registration.getStatus().name())
                .attendeeDetails(userDetails)
                .build();
    }
}

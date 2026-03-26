package com.cts.ticketmanager.dto.mapper.registration;


import com.cts.ticketmanager.dto.registration.RegistrationDTO;
import com.cts.ticketmanager.models.Registration;

public class RegistrationDTOMapper {
    public static RegistrationDTO toDTO(Registration registration) {
//        return new RegistrationDTO(
//                registration.getRegistrationId(),
//                registration.getEventId(),
//                registration.getTicket().getTicketId(),
//                registration.getAttendee().getUserId(),
//                registration.getAttendeeId(),
//                registration.getAttendee().getName(),
//                registration.getAttendee().getEmail(),
//                registration.getAttendee().getPhone(),
//                registration.getStatus().name()
//        );
        return RegistrationDTO.builder()
                .registrationId(registration.getRegistrationId())
                .eventId(registration.getEventId())
                .ticketId(registration.getTicket().getTicketId())
                .attendeeId(registration.getAttendeeId())
                .status(registration.getStatus().name())
                .build();
    }

}

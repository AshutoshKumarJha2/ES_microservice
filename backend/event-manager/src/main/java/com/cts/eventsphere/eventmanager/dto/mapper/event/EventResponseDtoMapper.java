package com.cts.eventsphere.eventmanager.dto.mapper.event;

import com.cts.eventsphere.eventmanager.dto.event.EventResponseDto;
import com.cts.eventsphere.eventmanager.dto.user.OrganizerDto;
import com.cts.eventsphere.eventmanager.dto.venue.VenueDetailsDto;
import com.cts.eventsphere.eventmanager.model.Event;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.Optional;

/**
 * DTO Mapper for Event Response DTO.
 *
 * @author 2479623
 * @version 1.1
 * @since 26-03-2026
 */
@Component
public class EventResponseDtoMapper {

    /** Maps an event without venue or organizer details. */
    public EventResponseDto toDTO(Event event) {
        return toDTO(event, null, null);
    }

    /** Maps an event with an optionally pre-fetched venue detail, no organizer. */
    public EventResponseDto toDTO(Event event, VenueDetailsDto venue) {
        return toDTO(event, venue, null);
    }

    /** Maps an event with optionally pre-fetched venue and organizer details. */
    public EventResponseDto toDTO(Event event, VenueDetailsDto venue, OrganizerDto organizer) {
        return EventResponseDto.builder()
                .id(event.getEventId())
                .eventName(event.getName())
                .organizerId(event.getOrganizerId())
                .startAt(Optional.ofNullable(event.getStartDate())
                        .map(LocalDate::toString)
                        .orElse(null))
                .endAt(Optional.ofNullable(event.getEndDate())
                        .map(LocalDate::toString)
                        .orElse(null))
                .status(event.getStatus())
                .venueId(event.getVenueId())
                .venue(venue)
                .organizer(organizer)
                .build();
    }
}

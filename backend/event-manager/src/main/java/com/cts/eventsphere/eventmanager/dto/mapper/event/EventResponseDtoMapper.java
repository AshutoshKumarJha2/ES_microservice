package com.cts.eventsphere.eventmanager.dto.mapper.event;

import com.cts.eventsphere.eventmanager.dto.event.EventResponseDto;
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

    /** Maps an event without venue details (venue field will be null). */
    public EventResponseDto toDTO(Event event) {
        return toDTO(event, null);
    }

    /** Maps an event with an optionally pre-fetched venue detail. */
    public EventResponseDto toDTO(Event event, VenueDetailsDto venue) {
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
                .build();
    }
}

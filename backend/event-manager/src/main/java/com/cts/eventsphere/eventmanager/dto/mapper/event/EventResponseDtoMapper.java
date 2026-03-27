package com.cts.eventsphere.eventmanager.dto.mapper.event;

import com.cts.eventsphere.eventmanager.dto.event.EventResponseDto;
import com.cts.eventsphere.eventmanager.model.Event;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * DTO Mapper for Event Response DTO.
 * * @author 2479623
 *
 * @version 1.0
 * @since 26-03-2026
 */
@Component
public class EventResponseDtoMapper {
    public EventResponseDto toDTO(Event event) {
        return EventResponseDto.builder()
                .id(event.getEventId())
                .eventName(event.getName())
                .organizerId(event.getOrganizerId())
                .startAt(Optional.ofNullable(event.getStartDate())
                        .map(LocalDateTime::toString)
                        .orElse(null))
                .endAt(Optional.ofNullable(event.getEndDate())
                        .map(LocalDateTime::toString)
                        .orElse(null))
                .status(event.getStatus())
                .venueId(event.getVenueId())
                .build();
    }
}

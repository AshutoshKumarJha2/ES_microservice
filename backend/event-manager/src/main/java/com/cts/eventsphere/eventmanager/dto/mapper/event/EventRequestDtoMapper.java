package com.cts.eventsphere.eventmanager.dto.mapper.event;

import com.cts.eventsphere.eventmanager.dto.event.EventRequestDto;
import com.cts.eventsphere.eventmanager.model.Event;
import com.cts.eventsphere.eventmanager.model.data.EventStatus;
import org.springframework.stereotype.Component;

/**
 * DTO Mapper for Request DTO of Event.
 * * @author 2479623
 *
 * @version 1.0
 * @since 26-03-2026
 */
@Component
public class EventRequestDtoMapper {
    public Event toEntity(EventRequestDto dto) {
        if(dto == null) {
            return null;
        }

        return Event.builder()
                .name(dto.name())
                .organizerId(dto.organizerId())
                .startDate(dto.startDate())
                .endDate(dto.endDate())
                .venueId(dto.venueId())
                .status(dto.status() == null ? EventStatus.draft : dto.status())
                .build();
    }
}

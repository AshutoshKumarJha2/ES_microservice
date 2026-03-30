package com.cts.venue_manager.dto.mapper.event;

//import com.cts.venue_manager.eventmanager.dto.event.EventRequestDto;
//import com.cts.venue_manager.eventmanager.model.Event;
//import com.cts.venue_manager.eventmanager.model.data.EventStatus;
import com.cts.venue_manager.client.model.Event;
import com.cts.venue_manager.client.model.data.EventStatus;
import com.cts.venue_manager.dto.event.EventRequestDto;
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
    public static Event toEntity(EventRequestDto dto) {
        if(dto == null) {
            return null;
        }

        return Event.builder()
                .name(dto.name())
                .organizerId(dto.organizerId())
                .startDate(dto.startDate())
                .endDate(dto.endDate())
                .venueId(dto.venueId())
                .status(dto.status() == null ? EventStatus.DRAFT : dto.status())
                .build();
    }
}

package com.cts.eventsphere.eventmanager.dto.mapper.schedule;

import com.cts.eventsphere.eventmanager.dto.schedule.ScheduleRequestDto;
import com.cts.eventsphere.eventmanager.model.Event;
import com.cts.eventsphere.eventmanager.model.Schedule;
import org.springframework.stereotype.Component;

/**
 * Dto Mapper for Schedule Request DTO.
 * * @author 2479623
 *
 * @version 1.0
 * @since 26-03-2026
 */
@Component
public class ScheduleRequestDtoMapper {
    public Schedule toEntity(ScheduleRequestDto dto, Event event) {
        if (dto == null) return null;

        return Schedule.builder()
                .event(event)
                .date(dto.date())
                .timeSlot(dto.timeSlot())
                .activity(dto.activity())
                .status(dto.status())
                .build();
    }
}

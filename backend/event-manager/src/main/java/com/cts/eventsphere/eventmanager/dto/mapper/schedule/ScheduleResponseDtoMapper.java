package com.cts.eventsphere.eventmanager.dto.mapper.schedule;

import com.cts.eventsphere.eventmanager.dto.schedule.ScheduleResponseDto;
import com.cts.eventsphere.eventmanager.model.Schedule;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.Optional;

/**
 * DTO Mapper for Schedule Response DTO.
 * * @author 2479623
 *
 * @version 1.0
 * @since 26-03-2026
 */
@Component
public class ScheduleResponseDtoMapper {
    public ScheduleResponseDto toDTO(Schedule schedule) {
        return ScheduleResponseDto.builder()
                .scheduleId(schedule.getScheduleId())
                .eventId(schedule.getEvent().getEventId())
                .date(Optional.ofNullable(schedule.getDate())
                        .map(LocalDate::toString)
                        .orElse(null))
                .timeSlot(schedule.getTimeSlot())
                .activity(schedule.getActivity())
                .status(schedule.getStatus())
                .build();
    }
}

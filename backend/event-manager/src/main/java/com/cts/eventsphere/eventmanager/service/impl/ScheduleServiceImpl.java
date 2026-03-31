package com.cts.eventsphere.eventmanager.service.impl;

import com.cts.eventsphere.eventmanager.dto.mapper.schedule.ScheduleRequestDtoMapper;
import com.cts.eventsphere.eventmanager.dto.mapper.schedule.ScheduleResponseDtoMapper;
import com.cts.eventsphere.eventmanager.dto.schedule.ScheduleRequestDto;
import com.cts.eventsphere.eventmanager.dto.schedule.ScheduleResponseDto;
import com.cts.eventsphere.eventmanager.exception.event.EventNotFoundException;
import com.cts.eventsphere.eventmanager.exception.schedule.ScheduleNotFoundException;
import com.cts.eventsphere.eventmanager.model.Event;
import com.cts.eventsphere.eventmanager.model.Schedule;
import com.cts.eventsphere.eventmanager.repository.EventRepository;
import com.cts.eventsphere.eventmanager.repository.ScheduleRepository;
import com.cts.eventsphere.eventmanager.service.NotificationService;
import com.cts.eventsphere.eventmanager.service.ScheduleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * Implementation for Service of Schedule Entity.
 * Provides business logic for updating and deleting schedules associated with events,
 * and triggers notifications with dynamic schedule details.
 *
 * @author 2479623
 * @version 1.1
 * @since 26-03-2026
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ScheduleServiceImpl implements ScheduleService {
    private final ScheduleRepository scheduleRepository;
    private final EventRepository eventRepository;
    private final ScheduleResponseDtoMapper scheduleResponseDtoMapper;
    private final ScheduleRequestDtoMapper scheduleRequestDtoMapper;
    private final NotificationService notificationService;

    /**
     * Updates an existing schedule by its unique identifier within a specific event
     * and triggers a notification with updated schedule details.
     *
     * @param eventId the unique identifier of the event to which the schedule belongs
     * @param id the unique identifier of the schedule to update
     * @param scheduleRequest the DTO containing updated schedule details
     * @return the response DTO representing the updated schedule
     * @throws ScheduleNotFoundException if no schedule exists with the given ID
     * @throws EventNotFoundException if the parent event does not exist
     */
    @Override
    public ScheduleResponseDto updateById(String eventId, String id, ScheduleRequestDto scheduleRequest) throws ScheduleNotFoundException {
        log.info("Attempting to update schedule ID: {} for event ID: {}", id, eventId);

        if(!scheduleRepository.existsById(id)) {
            log.error("Update failed: Schedule with ID {} does not exist", id);
            throw new ScheduleNotFoundException(id);
        }

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> {
                    log.error("Update failed: Event with ID {} not found", eventId);
                    return new EventNotFoundException(eventId);
                });

        log.debug("Mapping ScheduleRequestDto to Schedule entity for ID: {}", id);
        Schedule schedule = scheduleRequestDtoMapper.toEntity(scheduleRequest, event);
        schedule.setScheduleId(id);

        Schedule updatedSchedule = scheduleRepository.save(schedule);
        log.info("Successfully saved updated schedule ID: {}", updatedSchedule.getScheduleId());

        notificationService.sendNotification(
                event.getOrganizerId(),
                "Schedule Updated for Event: " + event.getName() +
                        " | Date: " + scheduleRequest.date() +
                        " | Time Slot: " + scheduleRequest.timeSlot() +
                        " | Activity: " + scheduleRequest.activity(),
                "EVENT"
        );

        return scheduleResponseDtoMapper.toDTO(updatedSchedule);
    }

    /**
     * Deletes a schedule by its unique identifier and triggers a notification.
     *
     * @param id the unique identifier of the schedule to delete
     * @return true if the deletion was successful, false otherwise
     * @throws ScheduleNotFoundException if no schedule exists with the given ID
     */
    @Override
    public boolean deleteById(String id) throws ScheduleNotFoundException {
        log.info("Attempting to delete schedule with ID: {}", id);

        Schedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Delete aborted: Schedule ID {} not found in repository", id);
                    return new ScheduleNotFoundException(id);
                });

        scheduleRepository.deleteById(id);
        log.info("Successfully deleted schedule with ID: {}", id);

        notificationService.sendNotification(
                schedule.getEvent().getOrganizerId(),
                "Schedule Deleted with ID: " + id,
                "EVENT"
        );

        return true;
    }
}

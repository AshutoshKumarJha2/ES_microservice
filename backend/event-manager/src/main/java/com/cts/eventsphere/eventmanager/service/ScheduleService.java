package com.cts.eventsphere.eventmanager.service;

import com.cts.eventsphere.eventmanager.dto.schedule.ScheduleBulkRequestDto;
import com.cts.eventsphere.eventmanager.dto.schedule.ScheduleRequestDto;
import com.cts.eventsphere.eventmanager.dto.schedule.ScheduleResponseDto;
import com.cts.eventsphere.eventmanager.exception.schedule.ScheduleNotFoundException;

import java.util.List;

/**
 * Service for Schedule Entity.
 * * @author 2479623
 *
 * @version 1.0
 * @since 26-03-2026
 */

public interface ScheduleService {
    /**
     * Retrieves a schedule by its unique identifier within a specific event.
     *
     * @param eventId the unique identifier of the event to which the schedule belongs
     * @param id the unique identifier of the schedule to retrieve
     * @return the response DTO representing the found schedule
     * @throws ScheduleNotFoundException if no schedule exists with the given ID
     */
    ScheduleResponseDto getById(String eventId, String id) throws ScheduleNotFoundException;

    /**
     * Retrieves multiple schedules by their unique identifiers (max 100).
     *
     * @param eventId the unique identifier of the event to which the schedules belong
     * @param ids the list of schedule IDs to retrieve
     * @return list of response DTOs for the found schedules
     */
    List<ScheduleResponseDto> getBulkByIds(String eventId, ScheduleBulkRequestDto request);

    /**
     * Updates an existing schedule by its unique identifier within a specific event.
     *
     * @param eventId the unique identifier of the event to which the schedule belongs
     * @param id the unique identifier of the schedule to update
     * @param schedule the request DTO containing updated schedule details
     * @return the response DTO representing the updated schedule
     * @throws ScheduleNotFoundException if no schedule exists with the given ID
     */
    ScheduleResponseDto updateById(String eventId, String id, ScheduleRequestDto schedule) throws ScheduleNotFoundException;

    /**
     * Deletes a schedule by its unique identifier.
     *
     * @param id the unique identifier of the schedule to delete
     * @return true if the deletion was successful, false otherwise
     * @throws ScheduleNotFoundException if no schedule exists with the given ID
     */
    boolean deleteById(String id) throws ScheduleNotFoundException;

}

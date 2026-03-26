package com.cts.eventsphere.eventmanager.service;

import com.cts.eventsphere.eventmanager.dto.schedule.ScheduleRequestDto;
import com.cts.eventsphere.eventmanager.dto.schedule.ScheduleResponseDto;
import com.cts.eventsphere.eventmanager.exception.schedule.ScheduleNotFoundException;

/**
 * Service for Schedule Entity.
 * * @author 2479623
 *
 * @version 1.0
 * @since 26-03-2026
 */

public interface ScheduleService {
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

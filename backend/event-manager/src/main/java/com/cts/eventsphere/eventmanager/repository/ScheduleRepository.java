package com.cts.eventsphere.eventmanager.repository;

import com.cts.eventsphere.eventmanager.model.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * JPA Repository for the Event Entity.
 * * @author 2479623
 *
 * @version 1.0
 * @since 25-03-2026
 */
public interface ScheduleRepository extends JpaRepository<Schedule, String> {
}

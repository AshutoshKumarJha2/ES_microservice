package com.cts.eventsphere.eventmanager.repository;

import com.cts.eventsphere.eventmanager.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

/**
 * JPA Repository for the Event Entity.
 * * @author 2479623
 *
 * @version 1.0
 * @since 25-03-2026
 */
@Repository
public interface EventRepository extends JpaRepository<Event, String>, JpaSpecificationExecutor<Event> {
    /**
     * Finds an event by its unique identifier.
     * This method queries the underlying data source to retrieve the event
     * associated with the given event ID.
     *
     * @param eventId the unique identifier of the event to be retrieved
     * @return the Event object corresponding to the provided ID, if found
     */
    Event findByEventId(String eventId);
}

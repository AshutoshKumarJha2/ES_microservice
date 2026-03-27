
package com.eventsphere.engagement_manager.repository;

import com.eventsphere.engagement_manager.model.Feedback;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

/**
 * JPA repository for Feedback entity
 *
 * @author 2480027
 * @version 1.0
 * @since 25-03-2026
 */
@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, String> {

    Page<Feedback> findByEventId(String eventId, Pageable pageable);

    Page<Feedback> findByEventIdAndAttendeeId(String eventId, String attendeeId, Pageable pageable);

    Page<Feedback> findByEventIdAndCreatedAtBetween(
            String eventId, LocalDateTime start, LocalDateTime end, Pageable pageable);
}
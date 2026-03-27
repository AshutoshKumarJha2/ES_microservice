

package com.eventsphere.engagement_manager.repository;

import com.eventsphere.engagement_manager.model.Engagement;
import com.eventsphere.engagement_manager.model.data.EngagementType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
/**
 * Jpa Repository for Engagement Operations
 *
 * @author 2480027
 * @version 1.0
 * @since 05-03-2026
 */
@Repository
public interface EngagementRepository extends JpaRepository<Engagement, String> {

    // Filter 1: All engagements for a specific event
    List<Engagement> findByEventId(String eventId);

    // Filter 2: Specific activity across all events
    List<Engagement> findByActivity(EngagementType activity);

    // Filter 3: Engagements within a time window
    List<Engagement> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    // Filter 4: Granular filtering
    List<Engagement> findByEventIdAndActivityAndCreatedAtBetween(
            String eventId, EngagementType activityId, LocalDateTime start, LocalDateTime end);
}
package com.eventsphere.engagement_manager.dto.client;

/**
 * [ Detailed description of the class's responsibility]
 *
 * @author 2480027
 * @version 1.0
 * @since 26-03-2026
 */

public record RegistrationStatusDto(
        String attendeeId,
        String eventId,
        String status    // e.g. "CONFIRMED", "CHECKED_IN", "CANCELLED"
) {}

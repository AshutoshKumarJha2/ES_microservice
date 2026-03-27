package com.eventsphere.engagement_manager.dto.shared;

/**
 * DTO object for generic response
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 2026-03-05
 */
public record GenericResponse(
        String message
) implements ResponseInterface {
    
}

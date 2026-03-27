package com.eventsphere.engagement_manager.dto.shared;

/**
 * DTO object for generic response
 *
 * @author 2480027
 * @version 1.0
 * @since 2026-03-26
 */
public record GenericResponse(
        String message
) implements ResponseInterface {
    
}

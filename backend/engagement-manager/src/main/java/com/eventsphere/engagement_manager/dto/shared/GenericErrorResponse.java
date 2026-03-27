package com.eventsphere.engagement_manager.dto.shared;

/**
 * DTO object for generic error response
 *
 * @author 2480027
 * @version 1.0
 * @since 2026-03-26
 */
public record GenericErrorResponse(
        String error
) implements ResponseInterface {
    
}

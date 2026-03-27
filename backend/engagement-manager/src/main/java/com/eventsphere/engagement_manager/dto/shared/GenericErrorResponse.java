package com.eventsphere.engagement_manager.dto.shared;

/**
 * DTO object for generic error response
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 2026-03-05
 */
public record GenericErrorResponse(
        String error
) implements ResponseInterface {
    
}

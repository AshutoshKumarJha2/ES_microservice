package com.cts.eventsphere.logmanager.dto.shared;

/**
 * DTO object for generic error response
 *
 * @author 2479623
 * @version 1.0
 * @since 2026-03-26
 */
public record GenericErrorResponse(
        String error
) implements ResponseInterface {

}

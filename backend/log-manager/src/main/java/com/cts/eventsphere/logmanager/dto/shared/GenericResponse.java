package com.cts.eventsphere.logmanager.dto.shared;

/**
 * DTO object for generic response
 *
 * @author 2479623
 * @version 1.0
 * @since 2026-03-26
 */
public record GenericResponse(
        String message
) implements ResponseInterface {

}

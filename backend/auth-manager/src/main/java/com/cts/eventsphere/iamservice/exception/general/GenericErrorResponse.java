package com.cts.eventsphere.iamservice.exception.general;

/**
 * Generic error response body returned by the {@link com.cts.eventsphere.iamservice.exception.GlobalExceptionHandler}
 * for all handled exceptions.
 *
 * <p>Provides a uniform JSON structure {@code {"error": "..."}} across all error responses,
 * making it easy for API consumers to parse failure reasons.</p>
 *
 * @param error a human-readable description of the error that occurred
 *
 * @author 2480010
 * @version 1.0
 * @since 26-03-2026
 */
public record GenericErrorResponse(
    String error
)implements ResponseInterface
{}

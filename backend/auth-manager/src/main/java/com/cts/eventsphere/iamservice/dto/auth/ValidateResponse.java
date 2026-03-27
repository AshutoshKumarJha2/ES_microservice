package com.cts.eventsphere.iamservice.dto.auth;

/**
 * Outbound DTO returned by the token-validation endpoint.
 *
 * <p>Other microservices call {@code GET /api/v1/auth/validate} (forwarded via the API Gateway)
 * to verify a Bearer token. On success, this DTO is returned so downstream services can
 * identify the caller without re-parsing the JWT.</p>
 *
 * @param userId   the UUID of the user the token belongs to
 * @param userRole the role embedded in the token (e.g. {@code "ADMIN"}, {@code "ATTENDEE"})
 *
 * @author 2480010
 * @version 1.0
 * @since 25-03-2026
 */
public record ValidateResponse(
        String userId,
        String userRole
) {
}

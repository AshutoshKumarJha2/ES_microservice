package com.cts.eventsphere.iamservice.dto.auth;

/**
 * Inbound DTO carrying user credentials for the login request.
 *
 * <p>Consumed by {@code POST /api/v1/auth/login}. The {@code role} field is informational
 * and currently not used for authentication validation — the authoritative role is always
 * read from the persisted {@link com.cts.eventsphere.iamservice.model.User} entity.</p>
 *
 * @param password the plain-text password to verify against the stored BCrypt hash
 * @param email    the email address that identifies the user account
 * @param role     the role the client claims (informational; not enforced during login)
 *
 * @author 2480010
 * @version 1.0
 * @since 22-03-2026
 */
public record LoginRequestDto(
        String password,
        String email,
        String role
) {
}

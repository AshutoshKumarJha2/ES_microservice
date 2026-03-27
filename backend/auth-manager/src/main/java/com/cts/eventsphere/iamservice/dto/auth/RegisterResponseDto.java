package com.cts.eventsphere.iamservice.dto.auth;

/**
 * Outbound DTO returned upon successful user registration.
 *
 * <p>Carries the newly created user's profile snapshot together with a human-readable
 * confirmation message. Returned by {@code POST /api/v1/auth/register}.</p>
 *
 * @param userId     the UUID of the newly registered user
 * @param userName   the display name of the registered user
 * @param userEmail  the email address used for registration
 * @param role       the string name of the role assigned to the new user (default: {@code "ATTENDEE"})
 * @param phoneNo    the phone number provided during registration
 * @param userStatus the string name of the initial account status (default: {@code "ACTIVE"})
 * @param message    a human-readable confirmation message (e.g. "User registered successfully with email: ...")
 *
 * @author 2480010
 * @version 1.0
 * @since 22-03-2026
 */
public record RegisterResponseDto(
        String userId,
        String userName,
        String userEmail,
        String role,
        String phoneNo,
        String userStatus,
        String message
) {
}

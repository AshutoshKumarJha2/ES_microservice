package com.cts.eventsphere.iamservice.dto.user;

/**
 * Inbound DTO carrying the user profile fields for registration and profile-update requests.
 *
 * <p>Used both by {@code POST /api/v1/auth/register} and {@code PUT /api/v1/users/{userId}}.
 * All fields are optional for update operations — only non-null values will be applied.</p>
 *
 * @param name     the display name of the user
 * @param email    the unique email address of the user
 * @param password the plain-text password (will be BCrypt-hashed before persistence)
 * @param phone    the contact phone number of the user
 *
 * @author 2480010
 * @version 1.0
 * @since 25-03-2026
 */
public record UserRequestDto(
        String name,
        String email,
        String password,
        String phone
)
{}

package com.cts.eventsphere.iamservice.dto.user;

import com.cts.eventsphere.iamservice.model.data.UserRoles;
import com.cts.eventsphere.iamservice.model.data.UserStatus;

/**
 * Outbound DTO representing a user's profile information returned by API responses.
 *
 * <p>Intentionally omits sensitive fields such as {@code password} and internal timestamps.
 * Produced by {@link com.cts.eventsphere.iamservice.mapper.UserResponseDtoMapper#toDTO(User)}.</p>
 *
 * @param userId  the unique identifier of the user (UUID string)
 * @param name    the display name of the user
 * @param role    the role assigned to the user (see {@link UserRoles})
 * @param email   the email address of the user
 * @param phone   the contact phone number of the user
 * @param status  the current account status (see {@link UserStatus})
 *
 * @author 2480010
 * @version 1.0
 * @since 25-03-2026
 */
public record UserResponseDto(
        String userId,
        String name,
        UserRoles role,
        String email,
        String phone,
        UserStatus status
)
{}

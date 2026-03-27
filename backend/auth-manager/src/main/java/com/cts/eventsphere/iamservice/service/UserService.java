package com.cts.eventsphere.iamservice.service;

import com.cts.eventsphere.iamservice.dto.user.UserRequestDto;
import com.cts.eventsphere.iamservice.dto.user.UserResponseDto;

import java.util.List;

/**
 * Service contract for user management operations within the Auth Manager.
 *
 * <p>Covers retrieval, profile updates, and administrative actions (status and role changes).
 * Implemented by {@link com.cts.eventsphere.iamservice.service.impl.UserServiceImpl}.</p>
 *
 * @author 2480010
 * @version 1.0
 * @since 25-03-2026
 */
public interface UserService {

    /**
     * Retrieves all registered users.
     *
     * @return a list of {@link UserResponseDto} for every user in the system; never {@code null}
     */
    List<UserResponseDto> getAllUsers();

    /**
     * Retrieves a single user by their unique identifier.
     *
     * @param userId the UUID string of the user to retrieve
     * @return the {@link UserResponseDto} for the found user
     * @throws com.cts.eventsphere.iamservice.exception.user.UserNotFoundException
     *         if no user with the given ID exists
     */
    UserResponseDto getUser(String userId);

    /**
     * Updates the mutable profile fields of an existing user.
     *
     * <p>Only non-null fields in {@code userRequestDto} are applied. If the email is changed,
     * uniqueness is enforced across existing accounts.</p>
     *
     * @param userId         the UUID string of the user to update
     * @param userRequestDto the new profile data; {@code null} fields are ignored
     * @return the updated {@link UserResponseDto}
     * @throws com.cts.eventsphere.iamservice.exception.user.UserNotFoundException
     *         if no user with the given ID exists
     * @throws com.cts.eventsphere.iamservice.exception.user.EmailAlreadyExistsException
     *         if the new email is already registered to another account
     */
    UserResponseDto updateUserDetails(String userId, UserRequestDto userRequestDto);

    /**
     * Changes the account status of a user (admin-only operation).
     *
     * @param userId the UUID string of the user whose status is to be changed
     * @param status the new status name matching a {@link com.cts.eventsphere.iamservice.model.data.UserStatus} constant
     * @return the updated {@link UserResponseDto}
     * @throws com.cts.eventsphere.iamservice.exception.user.UserNotFoundException
     *         if no user with the given ID exists
     * @throws IllegalArgumentException if {@code status} does not match a valid {@code UserStatus} constant
     */
    UserResponseDto changeUserStatus(String userId, String status);

    /**
     * Changes the role assigned to a user (admin-only operation).
     *
     * <p>After a successful role change, a notification log entry is attempted.
     * Notification failures are caught and logged without affecting the response.</p>
     *
     * @param userId the UUID string of the user whose role is to be changed
     * @param role   the new role name matching a {@link com.cts.eventsphere.iamservice.model.data.UserRoles} constant
     * @return the updated {@link UserResponseDto}
     * @throws com.cts.eventsphere.iamservice.exception.user.UserNotFoundException
     *         if no user with the given ID exists
     * @throws IllegalArgumentException if {@code role} does not match a valid {@code UserRoles} constant
     */
    UserResponseDto changeUserRole(String userId, String role);
}

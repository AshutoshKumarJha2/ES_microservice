package com.cts.eventsphere.iamservice.controller;

import com.cts.eventsphere.iamservice.dto.user.UserRequestDto;
import com.cts.eventsphere.iamservice.dto.user.UserResponseDto;
import com.cts.eventsphere.iamservice.security.UserPrincipal;
import com.cts.eventsphere.iamservice.service.UserService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller exposing user management endpoints for the Auth Manager service.
 *
 * <p>Base path: {@code /api/v1}. Administrative operations (list all users, change status,
 * change role) are restricted to users with the {@code ADMIN} role via
 * {@code @PreAuthorize}. The {@code /me} endpoint requires any authenticated user.</p>
 *
 * <p>Delegates all business logic to {@link UserService}.</p>
 *
 * @author 2480010
 * @version 1.0
 * @since 25-03-2026
 */
@RestController
@Data
@RequiredArgsConstructor
@RequestMapping("")
public class UserController {
    private final UserService userService;

    /**
     * Retrieves a list of all registered users (admin-only).
     *
     * <p>{@code GET /api/v1/users} — requires {@code ADMIN} role.</p>
     *
     * @return HTTP 200 OK with a list of {@link UserResponseDto}
     */
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponseDto>> getAllUsers(){
        return ResponseEntity.ok(userService.getAllUsers());
    }
    /**
     * Retrieves a user by their unique identifier.
     *
     * <p>{@code GET /api/v1/users/{userId}}</p>
     *
     * @param userId the UUID of the user to retrieve (passed in the request body)
     * @return HTTP 200 OK with the {@link UserResponseDto} for the found user
     */
    @GetMapping("/users/{userId}")
    public ResponseEntity<UserResponseDto> getUserById(@RequestBody String userId){
        return ResponseEntity.ok(userService.getUser(userId));
    }

    /**
     * Updates the profile details of an existing user.
     *
     * <p>{@code PUT /api/v1/users/{userId}} — only non-null fields in the request body are applied.</p>
     *
     * @param userId         the UUID of the user to update (passed in the request body)
     * @param userRequestDto the new profile data
     * @return HTTP 200 OK with the updated {@link UserResponseDto}
     */
    @PutMapping("/users/{userId}")
    public ResponseEntity<UserResponseDto> updateUserDetails(@RequestBody String userId, @RequestBody UserRequestDto userRequestDto){
        return ResponseEntity.ok(userService.updateUserDetails(userId,userRequestDto));
    }

    /**
     * Returns the profile of the currently authenticated user.
     *
     * <p>{@code GET /api/v1/me} — requires an authenticated request (valid access token).</p>
     *
     * @param userPrincipal the {@link UserPrincipal} of the currently authenticated user,
     *                      injected by Spring Security
     * @return HTTP 200 OK with the {@link UserResponseDto} of the authenticated user
     */
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserResponseDto> getMyDetails(@AuthenticationPrincipal UserPrincipal userPrincipal){
        String authenticatedUserId = userPrincipal.userId();
        return ResponseEntity.ok(userService.getUser(authenticatedUserId));
    }

    /**
     * Changes the account status of a user (admin-only).
     *
     * <p>{@code PATCH /api/v1/users/{userId}/status} — requires {@code ADMIN} role.</p>
     *
     * @param userId the UUID of the user whose status is to be changed
     * @param status the new status string (must match a {@link com.cts.eventsphere.iamservice.model.data.UserStatus} constant)
     * @return HTTP 200 OK with the updated {@link UserResponseDto}
     */
    @PatchMapping("/users/{userId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponseDto> changeUserStatus(@PathVariable String userId, @RequestParam String status) {
        UserResponseDto updatedUserStatus = userService.changeUserStatus(userId, status);
        return ResponseEntity.ok(updatedUserStatus);
    }

    /**
     * Changes the role assigned to a user (admin-only).
     *
     * <p>{@code PATCH /api/v1/users/{userId}/role} — requires {@code ADMIN} role.</p>
     *
     * @param userId the UUID of the user whose role is to be changed
     * @param role   the new role string (must match a {@link com.cts.eventsphere.iamservice.model.data.UserRoles} constant)
     * @return HTTP 200 OK with the updated {@link UserResponseDto}
     */
    @PatchMapping("/users/{userId}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponseDto> changeUserRole(@PathVariable String userId, @RequestParam String role) {
        UserResponseDto updatedUserRole = userService.changeUserRole(userId, role);
        return ResponseEntity.ok(updatedUserRole);
    }

}

package com.cts.eventsphere.logmanager.auth.dto;

import lombok.Data;

/**
 * Response payload returned by the auth-manager validate endpoint.
 * Carries the authenticated user's ID and role.
 *
 * @author 2479623
 * @version 1.0
 * @since 27-03-2026
 */
@Data
public class ValidateResponse {
    private String userId;
    private String userRole;
}

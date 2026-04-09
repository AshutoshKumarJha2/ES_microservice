package com.cts.eventsphere.eventmanager.auth.dto;

/**
 * Response from auth-manager's service token endpoint.
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 2026-04-06
 */
public record ServiceTokenResponse(String token, String tokenType, long expiresInSeconds) {}

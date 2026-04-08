package com.eventsphere.engagement_manager.auth.dto;

/**
 * Response from auth-manager's service token endpoint.
 *
 * @param token            the compact JWT service token
 * @param tokenType        the token type (typically {@code "Bearer"})
 * @param expiresInSeconds the token's validity period in seconds
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 2026-04-06
 */
public record ServiceTokenResponse(String token, String tokenType, long expiresInSeconds) {}

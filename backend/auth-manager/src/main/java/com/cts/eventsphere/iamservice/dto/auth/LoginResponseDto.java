package com.cts.eventsphere.iamservice.dto.auth;

/**
 * Outbound DTO returned upon a successful login or token-refresh operation.
 *
 * <p>Carries both the short-lived access token and the long-lived refresh token.
 * Returned by {@code POST /api/v1/auth/login} and {@code POST /api/v1/auth/refresh}.</p>
 *
 * @param accessToken  the JWT access token to be included in subsequent API requests
 *                     as {@code Authorization: Bearer <accessToken>}
 * @param refreshToken the JWT refresh token used to obtain a new access token when it expires
 * @param type         the token scheme; always {@code "Bearer"}
 *
 * @author 2480010
 * @version 1.0
 * @since 22-03-2026
 */
public record LoginResponseDto(
        String accessToken,
        String refreshToken,
        String type
)
{}

package com.cts.venue_manager.auth.dto;
public record ServiceTokenResponse(String token, String tokenType, long expiresInSeconds) {}

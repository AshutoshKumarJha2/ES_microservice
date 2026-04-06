package com.cts.eventsphere.logmanager.auth.dto;
public record ServiceTokenResponse(String token, String tokenType, long expiresInSeconds) {}

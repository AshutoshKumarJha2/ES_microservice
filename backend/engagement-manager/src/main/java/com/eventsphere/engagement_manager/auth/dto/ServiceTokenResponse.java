package com.eventsphere.engagement_manager.auth.dto;
public record ServiceTokenResponse(String token, String tokenType, long expiresInSeconds) {}

package com.cts.eventsphere.expensemanager.auth.dto;
public record ServiceTokenResponse(String token, String tokenType, long expiresInSeconds) {}

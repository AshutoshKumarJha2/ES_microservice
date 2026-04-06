package com.cts.eventsphere.vendormanager.auth.dto;
public record ServiceTokenResponse(String token, String tokenType, long expiresInSeconds) {}

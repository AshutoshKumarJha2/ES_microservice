package com.cts.eventsphere.eventmanager.auth.dto;

/**
 * Request payload sent to auth-manager to obtain a service token.
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 2026-04-06
 */
public record ServiceTokenRequest(String serviceName, String serviceSecret) {}

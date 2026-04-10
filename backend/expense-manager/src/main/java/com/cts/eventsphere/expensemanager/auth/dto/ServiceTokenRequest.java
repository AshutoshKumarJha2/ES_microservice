package com.cts.eventsphere.expensemanager.auth.dto;

/**
 * Request payload sent to auth-manager to obtain a service token.
 *
 * @param serviceName   the registered name of the calling service
 * @param serviceSecret the pre-shared secret for the calling service
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 2026-04-06
 */
public record ServiceTokenRequest(String serviceName, String serviceSecret) {}

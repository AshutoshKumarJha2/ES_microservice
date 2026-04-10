package com.cts.eventsphere.iamservice.dto.servicetoken;

/**
 * Request payload for the {@code POST /auth/service-token} endpoint.
 *
 * <p>The caller provides its registered service name and the corresponding
 * pre-shared secret. Auth-manager looks up the service in its registry,
 * validates the secret, and assigns the role server-side — the caller
 * cannot request a specific role.</p>
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 2026-04-06
 */
public record ServiceTokenRequest(String serviceName, String serviceSecret) {}

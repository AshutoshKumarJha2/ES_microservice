package com.cts.eventsphere.eventmanager.auth.service;

import com.cts.eventsphere.eventmanager.auth.client.ServiceTokenClient;
import com.cts.eventsphere.eventmanager.auth.dto.ServiceTokenRequest;
import com.cts.eventsphere.eventmanager.auth.dto.ServiceTokenResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Instant;

/**
 * Obtains a service token from auth-manager and caches it until near-expiry.
 *
 * <p>The token is refreshed proactively 30 seconds before it expires, so outgoing
 * service calls always carry a valid token without an extra round-trip per request.</p>
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 2026-04-06
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ServiceTokenProvider {

    private final ServiceTokenClient serviceTokenClient;

    @Value("${service.name:event-manager}")
    private String serviceName;

    @Value("${service.secret}")
    private String serviceSecret;

    private static final long BUFFER_SECONDS = 30L;

    private volatile String cachedToken;
    private volatile Instant tokenExpiry = Instant.EPOCH;

    public String getToken() {
        if (needsRefresh()) {
            refresh();
        }
        return cachedToken;
    }

    private boolean needsRefresh() {
        return cachedToken == null || Instant.now().isAfter(tokenExpiry.minusSeconds(BUFFER_SECONDS));
    }

    private synchronized void refresh() {
        if (!needsRefresh()) return;
        try {
            ServiceTokenResponse resp = serviceTokenClient.issueServiceToken(
                    new ServiceTokenRequest(serviceName, serviceSecret));
            this.cachedToken = resp.token();
            this.tokenExpiry = Instant.now().plusSeconds(resp.expiresInSeconds());
            log.debug("Service token refreshed for {}, expires at {}", serviceName, tokenExpiry);
        } catch (Exception e) {
            log.error("Failed to refresh service token for {}: {}", serviceName, e.getMessage());
            throw new IllegalStateException("Service token unavailable", e);
        }
    }
}

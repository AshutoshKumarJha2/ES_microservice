package com.cts.venue_manager.auth.service;

import com.cts.venue_manager.auth.client.ServiceTokenClient;
import com.cts.venue_manager.auth.dto.ServiceTokenRequest;
import com.cts.venue_manager.auth.dto.ServiceTokenResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.time.Instant;

@Component
@RequiredArgsConstructor
@Slf4j
public class ServiceTokenProvider {
    private final ServiceTokenClient serviceTokenClient;

    @Value("${service.name:venue-manager}")
    private String serviceName;

    @Value("${service.secret}")
    private String serviceSecret;

    private static final long BUFFER_SECONDS = 30L;
    private volatile String cachedToken;
    private volatile Instant tokenExpiry = Instant.EPOCH;

    public String getToken() {
        if (needsRefresh()) refresh();
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

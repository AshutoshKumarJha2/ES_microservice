package com.cts.eventsphere.eventmanager.config;

import com.cts.eventsphere.eventmanager.auth.service.ServiceTokenProvider;
import feign.Response;
import feign.RetryableException;
import feign.codec.ErrorDecoder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Feign {@link ErrorDecoder} that intercepts HTTP 401 responses from service-to-service
 * calls and triggers a service token cache invalidation followed by a single retry.
 *
 * <p>This recovers transparently from auth-manager restarts: the new auth-manager
 * issues tokens signed with a new private key, which the receiving service rejects
 * (stale public key). The receiving service's {@code PublicKeyProvider} refreshes
 * itself via its own retry-once mechanism in {@code ServiceTokenValidator}. Meanwhile,
 * this decoder ensures the <em>sending</em> service discards its stale cached token
 * and fetches a fresh one before the Feign retry.</p>
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 2026-04-06
 */
@RequiredArgsConstructor
@Slf4j
public class ServiceTokenErrorDecoder implements ErrorDecoder {

    private final ServiceTokenProvider serviceTokenProvider;
    private final ErrorDecoder defaultDecoder = new Default();

    /**
     * On HTTP 401, invalidates the cached service token so the next attempt
     * fetches a fresh one, then returns a {@link RetryableException} to trigger
     * Feign's retryer.  All other status codes are delegated to the default decoder.
     *
     * @param methodKey Feign method key identifying the call
     * @param response  the HTTP response received from the downstream service
     * @return a {@link RetryableException} for 401, otherwise the default decoded exception
     */
    @Override
    public Exception decode(String methodKey, Response response) {
        if (response.status() == 401) {
            log.warn("Received 401 on service call [{}], invalidating service token cache", methodKey);
            serviceTokenProvider.invalidate();
            return new RetryableException(
                    response.status(),
                    "Service token rejected by downstream — retrying with fresh token",
                    response.request().httpMethod(),
                    (Long) null,
                    response.request()
            );
        }
        return defaultDecoder.decode(methodKey, response);
    }
}

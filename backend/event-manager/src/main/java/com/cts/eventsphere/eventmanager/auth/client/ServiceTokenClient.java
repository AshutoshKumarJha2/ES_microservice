package com.cts.eventsphere.eventmanager.auth.client;

import com.cts.eventsphere.eventmanager.auth.dto.ServiceTokenRequest;
import com.cts.eventsphere.eventmanager.auth.dto.ServiceTokenResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

/**
 * Feign client for obtaining RSA-signed service tokens and the RSA public key
 * from auth-manager.
 *
 * <p>No Feign configuration is applied here — this client must NOT use
 * the {@code ServiceTokenInterceptor} to avoid a circular dependency
 * (the interceptor itself calls this client).</p>
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 2026-04-06
 */
@FeignClient(name = "auth-manager", contextId = "serviceTokenClient", path = "/auth")
public interface ServiceTokenClient {

    @PostMapping("/service-token")
    ServiceTokenResponse issueServiceToken(@RequestBody ServiceTokenRequest request);

    @GetMapping("/service-token/public-key")
    String getPublicKey();
}

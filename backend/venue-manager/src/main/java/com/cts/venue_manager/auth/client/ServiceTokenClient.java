package com.cts.venue_manager.auth.client;

import com.cts.venue_manager.auth.dto.ServiceTokenRequest;
import com.cts.venue_manager.auth.dto.ServiceTokenResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "auth-manager", contextId = "serviceTokenClient", path = "/auth")
public interface ServiceTokenClient {
    @PostMapping("/service-token")
    ServiceTokenResponse issueServiceToken(@RequestBody ServiceTokenRequest request);
    @GetMapping("/service-token/public-key")
    String getPublicKey();
}

package com.cts.eventsphere.eventmanager.auth.client;

import com.cts.eventsphere.eventmanager.auth.dto.ValidateResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Feign client for the auth-manager IAM service.
 * Mirrors all endpoints exposed by {@code AuthController}.
 *
 * @author 2480010
 * @version 1.0
 * @since 26-03-2026
 */
@FeignClient(name = "auth-manager", path = "/api/v1/auth")
public interface IAMClient {
    @GetMapping("/validate")
    ResponseEntity<ValidateResponse> validate(@RequestHeader("Authorization") String authHeader);
}

package com.cts.eventsphere.logmanager.auth.client;

import com.cts.eventsphere.logmanager.auth.dto.ValidateResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Feign client for the auth-manager IAM service.
 * Mirrors the validate endpoint exposed by {@code AuthController}.
 *
 * @author 2479623
 * @version 1.0
 * @since 27-03-2026
 */
@FeignClient(name = "auth-manager", path = "/auth")
public interface IAMClient {

    /**
     * Validates a bearer token against the auth-manager and returns user details.
     *
     * @param authHeader the raw {@code Authorization: Bearer <token>} header value
     * @return a {@link ResponseEntity} containing the validated user's details
     */
    @GetMapping("/validate")
    ResponseEntity<ValidateResponse> validate(@RequestHeader("Authorization") String authHeader);
}

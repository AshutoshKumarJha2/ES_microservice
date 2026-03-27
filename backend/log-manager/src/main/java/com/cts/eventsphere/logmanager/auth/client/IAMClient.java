package com.cts.eventsphere.logmanager.auth.client;

import com.cts.eventsphere.logmanager.auth.dto.ValidateResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "auth-manager", path = "/api/v1/auth")
public interface IAMClient {
    @GetMapping("/validate")
    ResponseEntity<ValidateResponse> validate(@RequestHeader("Authorization") String authHeader);
}

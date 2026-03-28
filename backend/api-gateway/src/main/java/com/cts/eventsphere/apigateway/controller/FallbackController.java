package com.cts.eventsphere.apigateway.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

/**
 * Handles circuit breaker fallback responses for all downstream service routes.
 *
 * <p>Invoked via an internal forward (e.g. {@code forward:/fallback/event-manager})
 * when the circuit breaker on a gateway route trips due to repeated failures.
 * Returns a structured HTTP 503 response so clients receive a consistent error
 * format rather than a raw connection error.</p>
 *
 * @author 2479623
 * @version 1.0
 * @since 27-03-2026
 */
@RestController
@RequestMapping("/fallback")
public class FallbackController {

    /**
     * Returns a 503 Service Unavailable response identifying the affected service.
     *
     * @param service the service name extracted from the fallback URI path (e.g. {@code event-manager})
     * @return a {@link ResponseEntity} with status 503 and a JSON error body
     */
    @RequestMapping("/{service}")
    public ResponseEntity<Map<String, Object>> fallback(@PathVariable String service) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of(
                        "status", 503,
                        "error", "Service Unavailable",
                        "message", service + " is temporarily unavailable. Please try again later.",
                        "timestamp", Instant.now().toString()
                ));
    }

}

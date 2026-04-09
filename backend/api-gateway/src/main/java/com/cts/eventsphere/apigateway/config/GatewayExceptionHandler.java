package com.cts.eventsphere.apigateway.config;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.Map;

/**
 * Converts LoadBalancer "no instances available" exceptions into a structured
 * 503 Service Unavailable response, consistent with {@code FallbackController}.
 *
 * <p>Without this handler, when the circuit breaker has not yet accumulated enough
 * failures to open (first few requests after startup), an {@link IllegalStateException}
 * thrown by Spring Cloud LoadBalancer would propagate unhandled and become a 500.</p>
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 08-04-2026
 */
@RestControllerAdvice
public class GatewayExceptionHandler {

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, Object>> handleNoInstances(
            IllegalStateException ex, HttpServletRequest request) {

        String message = ex.getMessage();
        if (message != null && message.contains("No instances available")) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of(
                            "status", 503,
                            "error", "Service Unavailable",
                            "message", message,
                            "timestamp", Instant.now().toString()
                    ));
        }
        throw ex;
    }
}
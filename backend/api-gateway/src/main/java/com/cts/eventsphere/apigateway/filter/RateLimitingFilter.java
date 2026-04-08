package com.cts.eventsphere.apigateway.filter;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.resilience4j.ratelimiter.RateLimiter;
import io.github.resilience4j.ratelimiter.RateLimiterRegistry;
import io.github.resilience4j.ratelimiter.RequestNotPermitted;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;

/**
 * Servlet filter that enforces per-client IP rate limiting using Resilience4J.
 *
 * <p>Each unique client IP is assigned its own {@link RateLimiter} instance
 * from the {@link RateLimiterRegistry}. Requests exceeding the configured limit
 * are rejected immediately with HTTP 429 before reaching gateway routing.</p>
 *
 * <p>The real client IP is resolved from the {@code X-Forwarded-For} header when
 * the gateway sits behind a proxy or load balancer.</p>
 *
 * @author 2479623
 * @version 1.0
 * @since 27-03-2026
 * @see RateLimiterRegistry
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 1)
public class RateLimitingFilter extends OncePerRequestFilter {

    private final RateLimiterRegistry rateLimiterRegistry;
    private final ObjectMapper objectMapper;

    /**
     * Constructs the filter with the required rate limiter registry and JSON mapper.
     *
     * @param rateLimiterRegistry the registry from which per-IP rate limiters are retrieved or created
     * @param objectMapper        used to serialise the 429 error response body as JSON
     */
    public RateLimitingFilter(RateLimiterRegistry rateLimiterRegistry, ObjectMapper objectMapper) {
        this.rateLimiterRegistry = rateLimiterRegistry;
        this.objectMapper = objectMapper;
    }

    /**
     * Attempts to acquire a rate limiter permit for the resolved client IP.
     * Proceeds with the filter chain on success; writes a 429 JSON response on failure.
     *
     * @param request  the incoming HTTP request
     * @param response the outgoing HTTP response
     * @param chain    the remaining filter chain
     * @throws ServletException if a servlet error occurs downstream
     * @throws IOException      if an I/O error occurs while writing the response
     */
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String clientKey = resolveClientKey(request);
        RateLimiter rateLimiter = rateLimiterRegistry.rateLimiter(clientKey);

        try {
            rateLimiter.acquirePermission();
            chain.doFilter(request, response);
        } catch (RequestNotPermitted e) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            objectMapper.writeValue(response.getWriter(), Map.of(
                    "status", 429,
                    "error", "Too Many Requests",
                    "message", "Rate limit exceeded. Please slow down.",
                    "timestamp", Instant.now().toString()
            ));
        }
    }

    /**
     * Resolves the client's IP address, preferring the first entry in
     * {@code X-Forwarded-For} when the gateway is behind a proxy.
     *
     * @param request the incoming HTTP request
     * @return the resolved client IP string used as the rate limiter key
     */
    private String resolveClientKey(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            return xff.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

}

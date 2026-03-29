package com.cts.eventsphere.apigateway.config;

import io.github.resilience4j.circuitbreaker.CircuitBreakerConfig;
import io.github.resilience4j.ratelimiter.RateLimiterConfig;
import io.github.resilience4j.ratelimiter.RateLimiterRegistry;
import org.springframework.cloud.circuitbreaker.resilience4j.Resilience4JCircuitBreakerFactory;
import org.springframework.cloud.client.circuitbreaker.Customizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

/**
 * Resilience configuration for the API Gateway.
 *
 * <p>Configures Resilience4J circuit breakers for each downstream service route
 * and a {@link RateLimiterRegistry} used by {@code RateLimitingFilter} to enforce
 * per-client IP request limits.</p>
 *
 * @author 2479623
 * @version 1.0
 * @since 27-03-2026
 */
@Configuration
public class ResilienceConfig {

    /**
     * Applies a shared {@link CircuitBreakerConfig} to all downstream service circuit breakers
     * registered in {@code GatewayConfig}.
     *
     * <p>Circuit breaker behaviour:</p>
     * <ul>
     *   <li>Opens after 50% failure rate over a sliding window of 10 calls</li>
     *   <li>Waits 10 seconds in open state before transitioning to half-open</li>
     *   <li>Allows 3 probe calls in half-open state before deciding to close or reopen</li>
     *   <li>Treats calls slower than 2 seconds as failures (80% slow-call threshold)</li>
     * </ul>
     *
     * @return a {@link Customizer} that applies the circuit breaker config to named instances
     */
    @Bean
    public Customizer<Resilience4JCircuitBreakerFactory> circuitBreakerConfig() {
        CircuitBreakerConfig config = CircuitBreakerConfig.custom()
                .slidingWindowSize(10)
                .failureRateThreshold(50)
                .waitDurationInOpenState(Duration.ofSeconds(10))
                .permittedNumberOfCallsInHalfOpenState(3)
                .slowCallDurationThreshold(Duration.ofSeconds(2))
                .slowCallRateThreshold(80)
                .build();

        return f -> f.configure(
                builder -> builder.circuitBreakerConfig(config),
                "auth-manager-cb", "event-manager-cb", "log-manager-cb",
                "engagement-manager-cb", "expense-manager-cb",
                "venue-manager-cb", "vendor-manager-cb"
        );
    }

    /**
     * Creates a {@link RateLimiterRegistry} with a default config applied to all
     * dynamically-created per-IP rate limiter instances in {@code RateLimitingFilter}.
     *
     * <p>Default limits: 50 requests per second per client IP.
     * {@code timeoutDuration} is set to zero so requests are rejected immediately
     * rather than queued when the limit is exceeded.</p>
     *
     * @return a configured {@link RateLimiterRegistry}
     */
    @Bean
    public RateLimiterRegistry rateLimiterRegistry() {
        RateLimiterConfig config = RateLimiterConfig.custom()
                .limitForPeriod(50)
                .limitRefreshPeriod(Duration.ofSeconds(1))
                .timeoutDuration(Duration.ZERO)
                .build();
        return RateLimiterRegistry.of(config);
    }

}

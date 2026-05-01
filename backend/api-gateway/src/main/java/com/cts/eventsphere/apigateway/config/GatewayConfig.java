package com.cts.eventsphere.apigateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.function.RouterFunction;
import org.springframework.web.servlet.function.ServerResponse;

import java.net.URI;

import static org.springframework.cloud.gateway.server.mvc.filter.BeforeFilterFunctions.stripPrefix;
import static org.springframework.cloud.gateway.server.mvc.filter.CircuitBreakerFilterFunctions.circuitBreaker;
import static org.springframework.cloud.gateway.server.mvc.filter.LoadBalancerFilterFunctions.lb;
import static org.springframework.cloud.gateway.server.mvc.handler.GatewayRouterFunctions.route;
import static org.springframework.cloud.gateway.server.mvc.handler.HandlerFunctions.http;
import static org.springframework.cloud.gateway.server.mvc.predicate.GatewayRequestPredicates.path;

@Configuration
// api
public class GatewayConfig {
    @Bean
    RouterFunction<ServerResponse> customRoutes() {
        return route("auth-manager")
                .route(path("/api/v1/auth-manager/**"), http())
                .before(stripPrefix(3))
                .filter(circuitBreaker("auth-manager-cb", URI.create("forward:/fallback/auth-manager")))
                .filter(lb("AUTH-MANAGER"))
                .build()
                .and(route("event-manager")
                        .route(path("/api/v1/event-manager/**"), http())
                        .before(stripPrefix(3))
                        .filter(circuitBreaker("event-manager-cb", URI.create("forward:/fallback/event-manager")))
                        .filter(lb("EVENT-MANAGER"))
                        .build())
                .and(route("log-manager")
                        .route(path("/api/v1/log-manager/**"), http())
                        .before(stripPrefix(3))
                        .filter(circuitBreaker("log-manager-cb", URI.create("forward:/fallback/log-manager")))
                        .filter(lb("LOG-MANAGER"))
                        .build())
                .and(route("engagement-manager")
                        .route(path("/api/v1/engagement-manager/**"), http())
                        .before(stripPrefix(3))
                        .filter(circuitBreaker("engagement-manager-cb", URI.create("forward:/fallback/engagement-manager")))
                        .filter(lb("ENGAGEMENT-MANAGER"))
                        .build())
                .and(route("expense-manager")
                        .route(path("/api/v1/expense-manager/**"), http())
                        .before(stripPrefix(3))
                        .filter(circuitBreaker("expense-manager-cb", URI.create("forward:/fallback/expense-manager")))
                        .filter(lb("EXPENSE-MANAGER"))
                        .build())
                .and(route("venue-manager")
                        .route(path("/api/v1/venue-manager/**"), http())
                        .before(stripPrefix(3))
                        .filter(circuitBreaker("venue-manager-cb", URI.create("forward:/fallback/venue-manager")))
                        .filter(lb("VENUE-MANAGER"))
                        .build())
                .and(route("vendor-manager")
                        .route(path("/api/v1/vendor-manager/**"), http())
                        .before(stripPrefix(3))
                        .filter(circuitBreaker("vendor-manager-cb", URI.create("forward:/fallback/vendor-manager")))
                        .filter(lb("VENDOR-MANAGER"))
                        .build());
    }

}
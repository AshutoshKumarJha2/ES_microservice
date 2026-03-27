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
public class GatewayConfig {

    @Bean
    RouterFunction<ServerResponse> customRoutes() {
        return route("auth-manager")
                .route(path("/api/v1/auth-manager/**"), http())
                .before(stripPrefix(3))
                .filter(lb("AUTH-MANAGER"))
                .filter(circuitBreaker("auth-manager-cb", URI.create("forward:/fallback/auth-manager")))
                .build()
                .and(route("event-manager")
                        .route(path("/api/v1/event-manager/**"), http())
                        .before(stripPrefix(3))
                        .filter(lb("EVENT-MANAGER"))
                        .filter(circuitBreaker("event-manager-cb", URI.create("forward:/fallback/event-manager")))
                        .build())
                .and(route("log-manager")
                        .route(path("/api/v1/log-manager/**"), http())
                        .before(stripPrefix(3))
                        .filter(lb("LOG-MANAGER"))
                        .filter(circuitBreaker("log-manager-cb", URI.create("forward:/fallback/log-manager")))
                        .build())
                .and(route("engagement-manager")
                        .route(path("/api/v1/engagement-manager/**"), http())
                        .before(stripPrefix(3))
                        .filter(lb("ENGAGEMENT-MANAGER"))
                        .filter(circuitBreaker("engagement-manager-cb", URI.create("forward:/fallback/engagement-manager")))
                        .build())
                .and(route("expense-manager")
                        .route(path("/api/v1/expense-manager/**"), http())
                        .before(stripPrefix(3))
                        .filter(lb("EXPENSE-MANAGER"))
                        .filter(circuitBreaker("expense-manager-cb", URI.create("forward:/fallback/expense-manager")))
                        .build());
    }

}
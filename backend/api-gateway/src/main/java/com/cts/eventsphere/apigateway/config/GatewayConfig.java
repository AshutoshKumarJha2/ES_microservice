package com.cts.eventsphere.apigateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.function.RouterFunction;
import org.springframework.web.servlet.function.ServerResponse;

import static org.springframework.cloud.gateway.server.mvc.filter.BeforeFilterFunctions.stripPrefix;
import static org.springframework.cloud.gateway.server.mvc.filter.LoadBalancerFilterFunctions.lb;
import static org.springframework.cloud.gateway.server.mvc.handler.GatewayRouterFunctions.route;
import static org.springframework.cloud.gateway.server.mvc.handler.HandlerFunctions.http;
import static org.springframework.cloud.gateway.server.mvc.predicate.GatewayRequestPredicates.path;

@Configuration
public class GatewayConfig {

    @Bean
    RouterFunction<ServerResponse> customRoutes() {
        return route("event-manager")
                .route(path("/event-manager/**"), http())
                .before(stripPrefix(1))
                .filter(lb("EVENT-MANAGER"))
                .build()
                .and(
                        route("log-manager")
                                .route(path("/log-manager/**"), http())
                                .before(stripPrefix(1))
                                .filter(lb("LOG-MANAGER"))
                                .build()
                )
                .and(
                        route("auth-manager")
                                .route(path("/auth-manager/**"), http())
                                .before(stripPrefix(1))
                                .filter(lb("AUTH-MANAGER"))
                                .build()
                );
    }

}
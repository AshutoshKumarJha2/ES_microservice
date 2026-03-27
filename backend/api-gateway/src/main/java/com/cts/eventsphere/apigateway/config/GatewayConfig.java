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
<<<<<<< HEAD
                .build();
=======
                .build()
                .and(
                        route("log-manager")
                                .route(path("/log-manager/**"), http())
                                .before(stripPrefix(1))
                                .filter(lb("LOG-MANAGER"))
                                .build()
                );
>>>>>>> ab4a0a80fa6119bf2b594649c9818a617f9f5c0a
    }

}
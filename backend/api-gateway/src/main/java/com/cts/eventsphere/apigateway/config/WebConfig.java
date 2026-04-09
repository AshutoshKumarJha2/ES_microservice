package com.cts.eventsphere.apigateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.MediaType;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import org.springframework.web.servlet.function.RouterFunction;
import org.springframework.web.servlet.function.RouterFunctions;
import org.springframework.web.servlet.function.ServerResponse;

import java.net.URI;
import java.util.List;

/**
 * Web MVC routing configuration for the Swagger UI at the API Gateway.
 *
 * <p>Spring Cloud Gateway MVC does not propagate SpringDoc's
 * {@code SwaggerWebMvcConfigurer}, so the Swagger UI webjars assets,
 * the docs entry-point redirect, and the custom initializer script are
 * all wired as {@link RouterFunction} beans — the same mechanism the
 * gateway already uses for its proxy routes.</p>
 *
 * <p>The Swagger UI is accessible at {@code /docs} and loads OpenAPI
 * specs aggregated from each downstream service through the gateway.</p>
 *
 * @author 2479623
 * @version 1.0
 * @since 27-03-2026
 */
@Configuration
public class WebConfig {

    private static final String SWAGGER_INITIALIZER_JS = """
            window.onload = function() {
              window.ui = SwaggerUIBundle({
                urls: [
                  { url: "/api/v1/auth-manager/v3/api-docs",        name: "auth-manager"        },
                  { url: "/api/v1/event-manager/v3/api-docs",        name: "event-manager"       },
                  { url: "/api/v1/log-manager/v3/api-docs",          name: "log-manager"         },
                  { url: "/api/v1/expense-manager/v3/api-docs",      name: "expense-manager"     },
                  { url: "/api/v1/engagement-manager/v3/api-docs",   name: "engagement-manager"  },
                  { url: "/api/v1/vendor-manager/v3/api-docs",       name: "vendor-manager"      },
                  { url: "/api/v1/venue-manager/v3/api-docs",        name: "venue-manager"       }
                ],
                "urls.primaryName": "event-manager",
                dom_id: '#swagger-ui',
                presets: [
                  SwaggerUIBundle.presets.apis,
                  SwaggerUIStandalonePreset
                ],
                layout: "StandaloneLayout"
              });
            };
            """;

    /**
     * Registers a global CORS filter for all gateway routes.
     *
     * <p>The {@code spring.cloud.gateway.globalcors} property only applies to
     * the WebFlux-based gateway. This MVC gateway requires an explicit
     * {@link CorsFilter} bean so that preflight OPTIONS requests and actual
     * cross-origin requests receive the correct {@code Access-Control-*} headers
     * before any downstream forwarding or Spring Security processing occurs.</p>
     *
     * @return a {@link CorsFilter} configured to allow the Vite dev-server origin
     */
    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.setAllowedOrigins(List.of("http://localhost:5173"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }

    /**
     * Redirects {@code GET /docs} to the Swagger UI index page.
     *
     * @return a {@link RouterFunction} handling the entry-point redirect
     */
    @Bean
    RouterFunction<ServerResponse> swaggerDocsRedirect() {
        return RouterFunctions.route()
                .GET("/api/v1/docs", request -> ServerResponse
                        .temporaryRedirect(URI.create("/swagger-ui/index.html"))
                        .build())
                .build();
    }

    /**
     * Serves a custom {@code swagger-initializer.js} that configures the
     * Swagger UI with the aggregated downstream service API spec URLs.
     * This route is evaluated before the general webjars route so it
     * overrides the default initializer bundled in the swagger-ui webjars.
     *
     * @return a {@link RouterFunction} that returns the custom initializer script
     */
    @Bean
    RouterFunction<ServerResponse> swaggerInitializer() {
        return RouterFunctions.route()
                .GET("/swagger-ui/swagger-initializer.js", request -> ServerResponse
                        .ok()
                        .contentType(MediaType.parseMediaType("application/javascript"))
                        .body(SWAGGER_INITIALIZER_JS))
                .build();
    }

    /**
     * Serves the Swagger UI static assets (HTML, JS, CSS, fonts) directly
     * from the {@code org.webjars:swagger-ui:5.32.0} JAR on the classpath.
     *
     * @return a {@link RouterFunction} mapping {@code /swagger-ui/**} to
     *         the webjars classpath location
     */
    @Bean
    RouterFunction<ServerResponse> swaggerUiResources() {
        return RouterFunctions.resources(
                "/swagger-ui/**",
                new ClassPathResource("META-INF/resources/webjars/swagger-ui/5.32.0/")
        );
    }
}

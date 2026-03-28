package com.cts.eventsphere.eventmanager.config;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 * FeignAuthInterceptor is a Feign {@link RequestInterceptor} that automatically
 * propagates the {@code Authorization} header from the current inbound HTTP request
 * to all outgoing Feign requests made by this service.
 * This ensures that service-to-service calls (e.g. to the log-manager audit endpoint)
 * carry the original JWT, allowing downstream services to authenticate the request
 * and resolve the acting {@code UserPrincipal}.
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 2026-03-28
 */
@Component
public class FeignAuthInterceptor implements RequestInterceptor {

    /**
     * Intercepts every outgoing Feign request and appends the {@code Authorization}
     * header sourced from the current servlet request context, if present.
     *
     * @param template The {@link RequestTemplate} for the outgoing Feign request
     *                 to which the header will be applied.
     */
    @Override
    public void apply(RequestTemplate template) {
        ServletRequestAttributes attributes =
                (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            String authHeader = attributes.getRequest().getHeader("Authorization");
            if (authHeader != null) {
                template.header("Authorization", authHeader);
            }
        }
    }
}

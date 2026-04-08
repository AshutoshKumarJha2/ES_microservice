package com.cts.eventsphere.vendormanager.config;

import com.cts.eventsphere.vendormanager.auth.service.ServiceTokenProvider;
import feign.RequestInterceptor;
import feign.RequestTemplate;
import lombok.RequiredArgsConstructor;

/**
 * Feign {@link RequestInterceptor} that attaches a service token to outgoing requests.
 *
 * <p>Intentionally NOT annotated with {@code @Component}. It is instantiated only
 * through {@link ServiceFeignConfig}, which is applied selectively to Feign clients
 * that call other microservices — {@code IAMClient} and {@code ServiceTokenClient}
 * are excluded to prevent circular token dependency.</p>
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 2026-04-06
 */
@RequiredArgsConstructor
public class ServiceTokenInterceptor implements RequestInterceptor {
    private final ServiceTokenProvider serviceTokenProvider;

    @Override
    public void apply(RequestTemplate template) {
        template.header("Authorization", "Bearer " + serviceTokenProvider.getToken());
    }
}

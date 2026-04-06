package com.cts.eventsphere.eventmanager.config;

import com.cts.eventsphere.eventmanager.auth.service.ServiceTokenProvider;
import org.springframework.context.annotation.Bean;

/**
 * Per-client Feign configuration that registers {@link ServiceTokenInterceptor}.
 *
 * <p>Applied via {@code @FeignClient(configuration = ServiceFeignConfig.class)} on
 * service-to-service clients (e.g. AuditClient, LogServiceClient). NOT applied to
 * {@code IAMClient} or {@code ServiceTokenClient} to preserve their existing behaviour.</p>
 *
 * <p>Must NOT be annotated with {@code @Configuration} at the class level — doing so
 * would register it globally and apply the interceptor to all Feign clients.</p>
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 2026-04-06
 */
public class ServiceFeignConfig {

    @Bean
    public ServiceTokenInterceptor serviceTokenInterceptor(ServiceTokenProvider provider) {
        return new ServiceTokenInterceptor(provider);
    }
}

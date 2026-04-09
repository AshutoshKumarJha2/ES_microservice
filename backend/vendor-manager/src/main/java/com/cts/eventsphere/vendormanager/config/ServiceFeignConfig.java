package com.cts.eventsphere.vendormanager.config;

import com.cts.eventsphere.vendormanager.auth.service.ServiceTokenProvider;
import feign.Retryer;
import feign.codec.ErrorDecoder;
import org.springframework.context.annotation.Bean;

/**
 * Per-client Feign configuration that registers {@link ServiceTokenInterceptor}.
 *
 * <p>Applied via {@code @FeignClient(configuration = ServiceFeignConfig.class)} on
 * service-to-service clients. NOT applied to {@code IAMClient} or
 * {@code ServiceTokenClient} to preserve their existing behaviour.</p>
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

    /**
     * Registers the error decoder that invalidates the service token cache on 401
     * and signals Feign to retry the request.
     *
     * @param provider the service token cache to invalidate on 401
     * @return the configured {@link ServiceTokenErrorDecoder}
     */
    @Bean
    public ErrorDecoder serviceTokenErrorDecoder(ServiceTokenProvider provider) {
        return new ServiceTokenErrorDecoder(provider);
    }

    /**
     * Limits retries to one attempt (initial + 1 retry) with a 100 ms interval,
     * sufficient to recover from a token invalidation without hammering downstream.
     *
     * @return a {@link Retryer} allowing exactly one retry
     */
    @Bean
    public Retryer serviceTokenRetryer() {
        return new Retryer.Default(100, 100, 2);
    }
}

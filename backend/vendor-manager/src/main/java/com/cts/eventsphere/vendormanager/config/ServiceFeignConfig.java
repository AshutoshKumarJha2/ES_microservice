package com.cts.eventsphere.vendormanager.config;

import com.cts.eventsphere.vendormanager.auth.service.ServiceTokenProvider;
import org.springframework.context.annotation.Bean;

// NOT @Configuration at class level — applies per-client only
public class ServiceFeignConfig {
    @Bean
    public ServiceTokenInterceptor serviceTokenInterceptor(ServiceTokenProvider provider) {
        return new ServiceTokenInterceptor(provider);
    }
}

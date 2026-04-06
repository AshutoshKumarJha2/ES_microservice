package com.eventsphere.engagement_manager.config;

import com.eventsphere.engagement_manager.auth.service.ServiceTokenProvider;
import feign.RequestInterceptor;
import feign.RequestTemplate;
import lombok.RequiredArgsConstructor;

// NOT @Component — only instantiated through ServiceFeignConfig
@RequiredArgsConstructor
public class ServiceTokenInterceptor implements RequestInterceptor {
    private final ServiceTokenProvider serviceTokenProvider;

    @Override
    public void apply(RequestTemplate template) {
        template.header("Authorization", "Bearer " + serviceTokenProvider.getToken());
    }
}

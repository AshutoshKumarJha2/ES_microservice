package com.cts.eventsphere.eventmanager.client;

import com.cts.eventsphere.eventmanager.config.ServiceFeignConfig;
import com.cts.eventsphere.eventmanager.dto.engagement.EngagementLogDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

/**
 * Feign client for engagement-manager.
 * Used to log REGISTRATION, REGISTRATION_CONFIRMATION, and CHECK_IN
 * engagement records whenever those events occur in event-manager.
 *
 * @author 2480027
 * @version 1.0
 * @since 18-04-2026
 */
@FeignClient(
        name = "engagement-manager",
        contextId = "engagementServiceClient",
        path = "/engagements",
        configuration = ServiceFeignConfig.class
)
public interface EngagementServiceClient {

    @PostMapping("/internal/log")
    void logEngagement(@RequestBody EngagementLogDto dto);
}

package com.cts.eventsphere.vendormanager.client;

import com.cts.eventsphere.vendormanager.config.ServiceFeignConfig;
import com.cts.eventsphere.vendormanager.dto.event.EventResponseDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "event-manager", configuration = ServiceFeignConfig.class)
public interface EventClient {

    @GetMapping("/events/{eventId}")
    EventResponseDto getEventDetails(@PathVariable("eventId") String eventId);

    default boolean checkEventExists(String eventId) {
        try {
            return getEventDetails(eventId) != null;
        } catch (Exception e) {
            return false;
        }
    }
}
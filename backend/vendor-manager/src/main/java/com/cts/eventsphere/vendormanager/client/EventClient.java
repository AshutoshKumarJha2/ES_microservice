package com.cts.eventsphere.vendormanager.client;

import com.cts.eventsphere.vendormanager.dto.event.EventResponseDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
@FeignClient(name = "event-service")
public interface EventClient {
    @GetMapping("/api/v1/events/{eventId}/exists")
    boolean checkEventExists(@PathVariable("eventId") String eventId);

    @GetMapping("/api/v1/events/{eventId}")
    EventResponseDto getEventDetails(@PathVariable("eventId") String eventId);
}
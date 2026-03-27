package com.eventsphere.engagement_manager.client;

import com.eventsphere.engagement_manager.dto.client.RegistrationStatusDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "event-service", url = "${services.event.url}")
public interface EventServiceClient {

//    @GetMapping("/api/v1/events/{eventId}")
//    EventResponseDto getEventById(@PathVariable String eventId);
//
//    @GetMapping("/api/v1/events/{eventId}/exists")
//    boolean eventExists(@PathVariable String eventId);
//
//    @GetMapping("/api/v1/events/{eventId}/tickets/{ticketId}")
//    TicketResponseDto getTicketById(
//        @PathVariable String eventId,
//        @PathVariable String ticketId
//    );
    @GetMapping("/api/registrations/attendee/{attendeeId}/event/{eventId}")
        // ↑ Replace this path with the actual endpoint in your RegistrationController
    RegistrationStatusDto getRegistrationStatus(
            @PathVariable String attendeeId,
            @PathVariable String eventId
    );
}

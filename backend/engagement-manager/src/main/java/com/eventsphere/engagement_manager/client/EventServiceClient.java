package com.eventsphere.engagement_manager.client;

import com.eventsphere.engagement_manager.auth.dto.UserPrincipal;
import com.eventsphere.engagement_manager.dto.client.RegistrationStatusDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
/**
 * EventService client
 *
 * @author 2480027
 * @version 1.0
 * @since 26-03-2026
 */
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
    @GetMapping("/api/v1/events/{eventId}/my-registration")
    RegistrationStatusDto getRegistrationStatus(
            @PathVariable String eventId,
            @AuthenticationPrincipal UserPrincipal userDetails

    );
}

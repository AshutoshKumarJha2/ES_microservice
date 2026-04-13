package com.eventsphere.engagement_manager.client;

import com.eventsphere.engagement_manager.config.ServiceFeignConfig;
import com.eventsphere.engagement_manager.dto.client.EventAnalyticsDto;
import com.eventsphere.engagement_manager.dto.client.RegistrationStatusDto;
import com.eventsphere.engagement_manager.dto.client.ScheduleBulkRequestDto;
import com.eventsphere.engagement_manager.dto.client.ScheduleDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

/**
 * EventService client
 *
 * @author 2480027
 * @version 1.0
 * @since 26-03-2026
 */
@FeignClient(name = "event-manager", configuration = ServiceFeignConfig.class)
public interface EventServiceClient {

    @GetMapping("/events/{eventId}/registrations/attendee/{attendeeId}")
    RegistrationStatusDto getRegistrationStatus(@PathVariable String eventId, @PathVariable String attendeeId);

    @GetMapping("/events/{eventId}/schedules/{scheduleId}")
    ScheduleDto getScheduleById(@PathVariable String eventId, @PathVariable String scheduleId);

    @GetMapping("/events/{eventId}/schedules/bulk")
    List<ScheduleDto> getBulkSchedules(@PathVariable String eventId, @RequestBody ScheduleBulkRequestDto request);

    @GetMapping("/events/{eventId}/analytics")
    EventAnalyticsDto getEventAnalytics(@PathVariable String eventId);
}

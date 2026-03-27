package com.cts.eventsphere.expensemanager.client;

import com.cts.eventsphere.expensemanager.client.dto.EventResponseDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

/**
 * Feign client for communicating with the <strong>Event &amp; Scheduling Service</strong>.
 *
 * <p>In the monolith, the Finance module directly injected {@code EventRepository}
 * to validate events. In the microservice architecture, this Feign client replaces
 * that direct database access with an HTTP call to the Event Service's REST API.</p>
 *
 * <p>Used by {@code BudgetServiceImpl} and {@code ExpenseServiceImpl} to:</p>
 * <ul>
 *   <li>Validate that an event exists before creating a budget or recording an expense</li>
 *   <li>Retrieve the event's {@code organizerId} (for future notification integration)</li>
 * </ul>
 *
 * @author 2480081
 * @version 1.0
 * @since 25-03-2026
 * @see EventResponseDto
 */
@FeignClient(name = "event-service", url = "${services.event.url}")
public interface EventServiceClient {

    /**
     * Fetches the full event details by event ID.
     *
     * @param eventId the UUID of the event to retrieve
     * @return the event details including organizerId, name, and status
     */
    @GetMapping("/events/{eventId}")
    EventResponseDto getEventById(@PathVariable String eventId);

    /**
     * Checks whether an event exists.
     *
     * @param eventId the UUID of the event to check
     * @return {@code true} if the event exists, {@code false} otherwise
     */
    @GetMapping("/events/{eventId}/exists")
    boolean eventExists(@PathVariable String eventId);
}

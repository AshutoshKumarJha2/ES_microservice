package com.cts.venue_manager.client.microservice;

import com.cts.venue_manager.dto.event.EventResponseDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

/**
 * Feign client interface for communicating with the event-manager microservice.
 * Handles synchronous REST calls to retrieve event-related data.
 * * @author 2479476
 * @version 1.0
 * @since 2026-03-27
 */
@FeignClient(name = "event-manager")
public interface EventClient {

    /**
     * Retrieves an event by its unique identifier from the event-manager service.
     *
     * @param id The unique identifier of the event to retrieve
     * @return A ResponseEntity containing the EventResponseDto
     */
    @GetMapping("/events/{id}")
    ResponseEntity<EventResponseDto> getById(@PathVariable("id") String id);
}
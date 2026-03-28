package com.cts.eventsphere.eventmanager.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

/**
 * Feign client for the log-manager notification service.
 * Mirrors the send endpoint exposed by {@code NotificationController}.
 *
 * <p>Used by {@code RegistrationServiceImpl} to dispatch in-app notifications
 * to attendees on registration status changes (pending, confirmed, cancelled,
 * rejected, checked-in).</p>
 *
 * <p>Calls are fire-and-forget: a failure to reach the log-manager must never
 * interrupt a registration operation. Callers are responsible for catching
 * {@link feign.FeignException} and logging it.</p>
 *
 * @author 2479623
 * @version 1.0
 * @since 27-03-2026
 */
@FeignClient(name = "log-manager", contextId = "logServiceClient", path = "/notifications")
public interface LogServiceClient {

    /**
     * Sends a notification to a user.
     *
     * @param userId   the ID of the user to notify
     * @param message  the notification message body
     * @param category the notification category (e.g. {@code "EVENT"})
     * @return an empty 201 response on success
     */
    @PostMapping("/send")
    ResponseEntity<Void> sendNotification(
            @RequestParam String userId,
            @RequestParam String message,
            @RequestParam String category
    );

}

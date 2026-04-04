package com.cts.eventsphere.eventmanager.service;

/**
 * NotificationService is responsible for dispatching in-app notifications to users.
 * It delegates to the log-manager microservice via a Feign client.
 * All implementations must ensure that failures to reach the log-manager never
 * propagate to the calling business operation.
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 30-03-2026
 */
public interface NotificationService {

    /**
     * Sends a notification to a user. Failures are swallowed so the caller's
     * operation is never interrupted.
     *
     * @param userId   the ID of the user to notify
     * @param message  the notification message body
     * @param category the notification category (must match a valid {@code NotificationCategory}
     *                 in the log-manager, e.g. {@code "EVENT"}, {@code "TICKET"})
     */
    void sendNotification(String userId, String message, String category);
}
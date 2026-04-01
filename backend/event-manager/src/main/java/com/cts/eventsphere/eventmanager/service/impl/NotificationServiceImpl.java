package com.cts.eventsphere.eventmanager.service.impl;

import com.cts.eventsphere.eventmanager.client.LogServiceClient;
import com.cts.eventsphere.eventmanager.service.NotificationService;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * NotificationServiceImpl is the concrete implementation of {@link NotificationService}.
 * It forwards notification requests to the log-manager microservice via {@link LogServiceClient}.
 * All {@link FeignException}s and unexpected errors are caught and logged as warnings so that
 * notification dispatch never interrupts the triggering business operation.
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 30-03-2026
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final LogServiceClient logServiceClient;

    /**
     * {@inheritDoc}
     *
     * <p>Delegates to {@link LogServiceClient#sendNotification(String, String, String)}.
     * Any {@link FeignException} or unexpected error is caught and logged; it is never re-thrown.</p>
     */
    @Override
    public void sendNotification(String userId, String message, String category) {
        log.debug("Sending notification: userId={}, category={}", userId, category);
        try {
            logServiceClient.sendNotification(userId, message, category);
            log.debug("Notification sent successfully: userId={}, category={}", userId, category);
        } catch (FeignException e) {
            log.warn("Notification rejected by log-manager: userId={}, category={} | HTTP status={}, body={}",
                    userId, category, e.status(), e.contentUTF8());
        } catch (Exception e) {
            log.warn("Notification call failed (connection/unexpected error): userId={}, category={} | error={}",
                    userId, category, e.getMessage());
        }
    }
}
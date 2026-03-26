package com.cts.eventsphere.logmanager.service;

/**
 * Email Service to send email updates for notifications.
 * * @author 2479623
 *
 * @version 1.0
 * @since 26-03-2026
 */
public interface EmailService {
    void sendNotificationEmail(String to, String subject, String body);
}

package com.cts.eventsphere.logmanager.dto.notification;

import com.cts.eventsphere.logmanager.model.data.NotificationCategory;


/**
 * RequestDto class for Notification
 *
 * @author 2479623
 * @version 1.0
 * @since 26-03-2026
 */
public record NotificationRequestDto (
        String userId,
        String eventId,
        String message,
        NotificationCategory category
){}

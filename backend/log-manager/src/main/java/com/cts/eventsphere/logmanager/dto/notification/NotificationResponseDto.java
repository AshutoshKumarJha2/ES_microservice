package com.cts.eventsphere.logmanager.dto.notification;

import com.cts.eventsphere.logmanager.model.data.NotificationCategory;
import com.cts.eventsphere.logmanager.model.data.NotificationStatus;

import java.time.LocalDateTime;

/**
 * ResponseDtoClass for Notification
 *
 * @author 2479623
 * @version 1.0
 * @since 26-03-2026
 */
public record NotificationResponseDto(

        String id,
        String userId,
        String eventId,
        String message,
        NotificationCategory category,
        NotificationStatus status,
        LocalDateTime createdDate
)
{

}

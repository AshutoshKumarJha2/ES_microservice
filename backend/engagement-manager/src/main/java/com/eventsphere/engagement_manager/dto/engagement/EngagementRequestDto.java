package com.eventsphere.engagement_manager.dto.engagement;


import com.eventsphere.engagement_manager.model.data.EngagementType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Pattern;
import lombok.Builder;

import java.time.LocalDateTime;

/**
 * EngagemenEngagementResponseDtotRequest dto representing engagement details with validation
 *
 * @author 2480027
 * @version 1.0
 * @since 25-03-2026
 */
@Builder
public record EngagementRequestDto(

        @NotBlank(message = "Event ID is required")
        @Pattern(regexp = "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$",
                message = "Event ID must be a valid UUID")
        String eventId,

        @NotBlank(message = "Attendee ID is required")
        @Pattern(regexp = "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$",
                message = "Attendee ID must be a valid UUID")
        String attendeeId,

        @NotNull(message = "Engagement activity type is required")
        EngagementType activity,

        @NotNull(message = "Activity timestamp is required")
        @PastOrPresent(message = "Activity cannot happen in the future")
        LocalDateTime activityTimestamp

) {
}
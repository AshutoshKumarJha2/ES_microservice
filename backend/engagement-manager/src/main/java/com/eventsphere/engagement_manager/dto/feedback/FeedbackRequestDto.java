package com.eventsphere.engagement_manager.dto.feedback;

import jakarta.validation.constraints.*;
import lombok.Builder;

import java.time.LocalDateTime;

/**
 * FeedbackRequestDto representing Feedback details with validation
 *
 * @author 2480027
 * @version 1.0
 * @since 02-03-2026
 */

@Builder
public record FeedbackRequestDto(

        @NotBlank(message = "Event ID is required")
        @Pattern(regexp = "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$",
                message = "Event ID must be a valid UUID")
        String eventId,

        @NotBlank(message = "Attendee ID is required")
        @Pattern(regexp = "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$",
                message = "Attendee ID must be a valid UUID")
        String attendeeId,

        @Min(value = 1, message = "Rating must be at least 1")
        @Max(value = 5, message = "Rating cannot exceed 5")
        int rating,

        @Size(max = 500, message = "Comments cannot exceed 500 characters")
        String comments,

        @NotNull(message = "Feedback date is required")
        @PastOrPresent(message = "Feedback date cannot be in the future")
        LocalDateTime createdAt
) {}
package com.eventsphere.engagement_manager.Exception;

import lombok.extern.slf4j.Slf4j;

/**
 * Custom exception for feedback entity with automated logging
 *
 * @author 2480027
 * @version 1.0
 * @since 05-03-2026
 */
@Slf4j
public class FeedbackNotFoundException extends RuntimeException {

    public FeedbackNotFoundException(String message) {
        super(message);
        log.error("Feedback Exception: {}", message);
    }
}
package com.cts.eventsphere.eventmanager.model.data;

import com.cts.eventsphere.eventmanager.model.Registration;

/**
 * Represents the lifecycle status of a {@link Registration}.
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 2026-03-26
 */
public enum RegistrationStatus {
    PENDING,
    CONFIRMED,
    CANCELLED,
    CHECKED_IN
}

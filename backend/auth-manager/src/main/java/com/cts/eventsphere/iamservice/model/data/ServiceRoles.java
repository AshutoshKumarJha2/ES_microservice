package com.cts.eventsphere.iamservice.model.data;

/**
 * Roles issued exclusively to internal services via the service token system.
 *
 * <p>Every service token carries {@link #SYSTEM} plus one specific {@code SYS_*} role
 * that identifies the calling service. Downstream services use these roles in
 * {@code @PreAuthorize} expressions to restrict endpoints to internal callers only.</p>
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 2026-04-06
 */
public enum ServiceRoles {
    /** Broad system role shared by all internal services. */
    SYSTEM,

    SYS_AUTH_MGR,
    SYS_EVENT_MGR,
    SYS_ENGAGEMENT_MGR,
    SYS_EXPENSE_MGR,
    SYS_LOG_MGR,
    SYS_VENUE_MGR,
    SYS_VENDOR_MGR
}

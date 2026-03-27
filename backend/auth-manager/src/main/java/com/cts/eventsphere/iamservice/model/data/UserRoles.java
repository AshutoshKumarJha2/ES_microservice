package com.cts.eventsphere.iamservice.model.data;

/**
 * Enumeration of the roles that can be assigned to a user within the EventSphere platform.
 *
 * <p>Roles drive Spring Security method-level authorization via {@code @PreAuthorize} expressions.</p>
 *
 * <ul>
 *   <li>{@link #ADMIN} – full administrative access.</li>
 *   <li>{@link #ORGANIZER} – can create and manage events.</li>
 *   <li>{@link #VENUE_MANAGER} – manages venue resources.</li>
 *   <li>{@link #FINANCE_OFFICER} – handles financial operations.</li>
 *   <li>{@link #ATTENDEE} – default role assigned at registration; can browse and attend events.</li>
 *   <li>{@link #VENDOR} – provides goods or services for events.</li>
 * </ul>
 *
 * @author 2480010
 * @version 1.0
 * @since 25-03-2026
 */
public enum UserRoles {
    /** Administrator with full platform access. */
    ADMIN,

    /** Event organizer responsible for creating and managing events. */
    ORGANIZER,

    /** Manages venue-related resources and bookings. */
    VENUE_MANAGER,

    /** Handles financial transactions and reporting. */
    FINANCE_OFFICER,

    /** Default role for registered users who attend events. */
    ATTENDEE,

    /** External vendor providing services or products for events. */
    VENDOR
}

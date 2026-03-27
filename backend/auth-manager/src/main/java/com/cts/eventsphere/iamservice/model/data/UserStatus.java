package com.cts.eventsphere.iamservice.model.data;

/**
 * Enumeration representing the possible lifecycle states of a user account.
 *
 * <ul>
 *   <li>{@link #ACTIVE} – the account is fully operational and may authenticate.</li>
 *   <li>{@link #INACTIVE} – the account has been deactivated; login is denied.</li>
 *   <li>{@link #SUSPENDED} – the account has been administratively suspended; login is denied.</li>
 * </ul>
 *
 * @author 2480010
 * @version 1.0
 * @since 25-03-2026
 */
public enum UserStatus {
    /** The user account is active and can log in. */
    ACTIVE,

    /** The user account has been deactivated and cannot log in. */
    INACTIVE,

    /** The user account has been suspended by an administrator and cannot log in. */
    SUSPENDED
}

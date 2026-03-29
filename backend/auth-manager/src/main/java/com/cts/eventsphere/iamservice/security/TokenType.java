package com.cts.eventsphere.iamservice.security;

/**
 * Enumeration distinguishing the two JWT token types used by the authentication flow.
 *
 * <ul>
 *   <li>{@link #ACCESS} – short-lived token (default 15 minutes) used to authorize API requests.</li>
 *   <li>{@link #REFRESH} – long-lived token (default 7 days) used solely to obtain a new access token.</li>
 * </ul>
 *
 * <p>The token type is embedded as a {@code "type"} claim inside each JWT so that
 * {@link JwtFilter} and {@link JwtUtil} can enforce correct usage.</p>
 *
 * @author 2480010
 * @version 1.0
 * @since 25-03-2026
 */
public enum TokenType {
    /** Short-lived JWT used to authorize API requests. */
    ACCESS,

    /** Long-lived JWT used exclusively to refresh an expired access token. */
    REFRESH
}

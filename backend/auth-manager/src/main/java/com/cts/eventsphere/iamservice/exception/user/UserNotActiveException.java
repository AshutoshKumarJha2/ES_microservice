package com.cts.eventsphere.iamservice.exception.user;

/**
 * Thrown when an operation requires the user account to be {@code ACTIVE} but the account
 * is in the {@code INACTIVE} state.
 *
 * <p>Raised during token refresh if the user's account has been deactivated since the
 * original login. Handled by
 * {@link com.cts.eventsphere.iamservice.exception.GlobalExceptionHandler},
 * which maps this exception to HTTP 401 Unauthorized.</p>
 *
 * @author 2480010
 * @version 1.0
 * @since 25-03-2026
 */
public class UserNotActiveException extends RuntimeException {

    /**
     * Constructs the exception with a detail message identifying the inactive user.
     *
     * @param userId the UUID of the user whose account is not active
     */
    public UserNotActiveException(String userId){
        super(String.format("User with id %s is not active", userId));
    }
}

package com.cts.eventsphere.iamservice.exception.user;

/**
 * Thrown during a token-refresh attempt when the role embedded in the refresh token no
 * longer matches the role stored in the database.
 *
 * <p>This guards against replaying a refresh token after an admin has changed the user's role.
 * The user must log in again to obtain tokens that reflect their current role.
 * Handled by {@link com.cts.eventsphere.iamservice.exception.GlobalExceptionHandler},
 * which maps this exception to HTTP 401 Unauthorized.</p>
 *
 * @author 2480010
 * @version 1.0
 * @since 25-03-2026
 */
public class RefreshFailedException extends RuntimeException {

    /**
     * Constructs the exception with a detail message prompting the user to log in again.
     *
     * @param userId the UUID of the user for whom the refresh attempt failed
     */
    public RefreshFailedException(String userId){
        super(String.format("Failed to authenticate user: %s, please login again", userId));
    }
}

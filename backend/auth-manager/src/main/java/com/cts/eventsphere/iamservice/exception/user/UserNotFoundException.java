package com.cts.eventsphere.iamservice.exception.user;

/**
 * Thrown when a lookup for a user by ID or email yields no result.
 *
 * <p>Handled by {@link com.cts.eventsphere.iamservice.exception.GlobalExceptionHandler},
 * which maps this exception to HTTP 404 Not Found.</p>
 *
 * @author 2480010
 * @version 1.0
 * @since 22-03-2026
 */
public class UserNotFoundException extends RuntimeException {

    /**
     * Constructs the exception with a caller-supplied detail message.
     *
     * @param message a description of which user was not found (e.g. the user ID or email)
     */
    public UserNotFoundException(String message) {
        super(message);
    }
}

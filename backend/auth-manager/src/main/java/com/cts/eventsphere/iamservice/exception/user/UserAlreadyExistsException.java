package com.cts.eventsphere.iamservice.exception.user;

/**
 * Thrown during registration when the provided email is already associated with an existing account.
 *
 * <p>Handled by {@link com.cts.eventsphere.iamservice.exception.GlobalExceptionHandler},
 * which maps this exception to HTTP 409 Conflict.</p>
 *
 * @author 2480010
 * @version 1.0
 * @since 10-03-2026
 */
public class UserAlreadyExistsException extends RuntimeException {

    /**
     * Constructs the exception with a detail message identifying the duplicate email.
     *
     * @param email the email address that is already registered in the system
     */
    public UserAlreadyExistsException(String email) {
        super("User with email " + email + " already exists.");
    }
}

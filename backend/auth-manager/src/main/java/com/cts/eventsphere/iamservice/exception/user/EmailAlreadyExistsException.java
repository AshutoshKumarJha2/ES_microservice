package com.cts.eventsphere.iamservice.exception.user;

/**
 * Thrown when a user attempts to update their profile to an email address that is already
 * registered to a different account.
 *
 * <p>Handled by {@link com.cts.eventsphere.iamservice.exception.GlobalExceptionHandler},
 * which maps this exception to HTTP 409 Conflict.</p>
 *
 * @author 2480010
 * @version 1.0
 * @since 10-03-2026
 */
public class EmailAlreadyExistsException extends RuntimeException{

    /**
     * Constructs the exception with a detail message identifying the duplicate email.
     *
     * @param email the email address that already exists in the system
     */
    public EmailAlreadyExistsException(String email) {
        super("Email " + email + " is already registered.");
    }
}

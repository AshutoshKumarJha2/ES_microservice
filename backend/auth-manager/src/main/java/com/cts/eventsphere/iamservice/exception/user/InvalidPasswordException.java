package com.cts.eventsphere.iamservice.exception.user;

/**
 * Thrown during login when the provided password does not match the stored BCrypt hash.
 *
 * <p>Handled by {@link com.cts.eventsphere.iamservice.exception.GlobalExceptionHandler},
 * which maps this exception to HTTP 400 Bad Request.</p>
 *
 * @author 2480010
 * @version 1.0
 * @since 10-03-2026
 */
public class InvalidPasswordException extends RuntimeException {

    /**
     * Constructs the exception with a caller-supplied detail message.
     *
     * @param message a description of the password validation failure
     */
    public InvalidPasswordException(String message) {
        super(message);
    }
}

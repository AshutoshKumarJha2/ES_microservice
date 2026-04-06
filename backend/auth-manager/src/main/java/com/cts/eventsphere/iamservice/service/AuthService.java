package com.cts.eventsphere.iamservice.service;

import com.cts.eventsphere.iamservice.dto.auth.LoginRequestDto;
import com.cts.eventsphere.iamservice.dto.auth.LoginResponseDto;
import com.cts.eventsphere.iamservice.dto.auth.RegisterResponseDto;
import com.cts.eventsphere.iamservice.dto.auth.ValidateResponse;
import com.cts.eventsphere.iamservice.dto.servicetoken.ServiceTokenRequest;
import com.cts.eventsphere.iamservice.dto.servicetoken.ServiceTokenResponse;
import com.cts.eventsphere.iamservice.dto.user.UserRequestDto;
import com.cts.eventsphere.iamservice.security.UserPrincipal;
/**
 * Service contract for authentication operations within the Auth Manager.
 *
 * <p>Defines the core authentication lifecycle: user registration, credential-based login,
 * JWT access-token refresh, and token validation. Implemented by
 * {@link com.cts.eventsphere.iamservice.service.impl.AuthServiceImpl}.</p>
 *
 * @author 2480010
 * @version 1.0
 * @since 25-03-2026
 */
public interface AuthService {

    /**
     * Registers a new user account using the supplied profile details.
     *
     * @param dto the registration payload containing name, email, password, and phone
     * @return a {@link RegisterResponseDto} with the new user's profile and a confirmation message
     * @throws com.cts.eventsphere.iamservice.exception.user.UserAlreadyExistsException
     *         if a user with the same email already exists
     */
    RegisterResponseDto register(UserRequestDto dto);

    /**
     * Authenticates a user with their email and password.
     *
     * @param loginDto the login credentials
     * @return a {@link LoginResponseDto} containing the access token, refresh token, and token type
     * @throws com.cts.eventsphere.iamservice.exception.user.UserNotFoundException
     *         if no user is found with the given email
     * @throws com.cts.eventsphere.iamservice.exception.user.InvalidPasswordException
     *         if the password does not match the stored hash
     */
    LoginResponseDto login(LoginRequestDto loginDto);

    /**
     * Issues a new pair of access and refresh tokens for an already-authenticated user.
     *
     * <p>The caller must present a valid refresh token. The role embedded in the token is
     * verified against the database; any mismatch causes {@link com.cts.eventsphere.iamservice.exception.user.RefreshFailedException}.</p>
     *
     * @param principal the security principal extracted from the refresh token
     * @return a {@link LoginResponseDto} containing fresh access and refresh tokens
     * @throws com.cts.eventsphere.iamservice.exception.user.UserNotFoundException
     *         if the user no longer exists
     * @throws com.cts.eventsphere.iamservice.exception.user.RefreshFailedException
     *         if the token role does not match the current persisted role
     * @throws com.cts.eventsphere.iamservice.exception.user.UserNotActiveException
     *         if the user account is inactive
     * @throws com.cts.eventsphere.iamservice.exception.user.UserSuspendedException
     *         if the user account is suspended
     */
    LoginResponseDto refreshToken(UserPrincipal principal);

    /**
     * Validates an access token supplied in an Authorization header.
     *
     * <p>Intended to be called by the API Gateway or other microservices to verify
     * a token before forwarding requests downstream.</p>
     *
     * @param authHeader the full {@code Authorization} header value (e.g. {@code "Bearer <token>"})
     * @return a {@link ValidateResponse} containing the user ID and role extracted from the token
     * @throws org.springframework.web.server.ResponseStatusException
     *         with HTTP 401 if the header is missing, malformed, or the token is invalid/expired
     */
    ValidateResponse validateToken(String authHeader);

    /**
     * Issues a short-lived RSA-signed service token to a verified internal service.
     *
     * <p>The caller supplies its registered service name and pre-shared secret.
     * The role embedded in the token is determined server-side from the service registry —
     * the caller cannot influence it.</p>
     *
     * @param request contains {@code serviceName} and {@code serviceSecret}
     * @return a {@link ServiceTokenResponse} with the signed JWT and expiry metadata
     * @throws org.springframework.web.server.ResponseStatusException with HTTP 401
     *         if the service name is not registered or the secret does not match
     */
    ServiceTokenResponse issueServiceToken(ServiceTokenRequest request);
}

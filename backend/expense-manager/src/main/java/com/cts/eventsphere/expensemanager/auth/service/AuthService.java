package com.cts.eventsphere.expensemanager.auth.service;



import feign.FeignException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.cts.eventsphere.expensemanager.auth.client.IAMClient;
import com.cts.eventsphere.expensemanager.auth.dto.UserPrincipal;
import com.cts.eventsphere.expensemanager.auth.dto.ValidateResponse;

import java.util.List;

/**
 * Validates bearer tokens against the auth-manager service and converts
 * the response into a {@link UserPrincipal} for use in the security context.
 *
 * @author 2480010
 * @version 1.0
 * @since 26-03-2026
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final IAMClient iamClient;

    /**
     * Calls the IAM validate endpoint and returns a {@link UserPrincipal}
     * on success.
     *
     * @param authHeader the raw {@code Authorization: Bearer <token>} header value
     * @return the authenticated principal
     * @throws ResponseStatusException 401 if the token is missing, invalid, or rejected by IAM
     */
    public UserPrincipal validate(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing or invalid Authorization header");
        }

        try {
            ResponseEntity<ValidateResponse> response = iamClient.validate(authHeader);

            if (response.getStatusCode() != HttpStatus.OK || response.getBody() == null) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token validation failed");
            }

            ValidateResponse body = response.getBody();
            var authority = new SimpleGrantedAuthority("ROLE_" + body.getUserRole());

            return new UserPrincipal(body.getUserId(), body.getUserRole(), List.of(authority));

        } catch (FeignException.Unauthorized | FeignException.Forbidden e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid or expired token");
        }
    }
}

package com.cts.eventsphere.logmanager.auth.service;

import com.cts.eventsphere.logmanager.auth.dto.UserPrincipal;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

/**
 * Validates user access tokens locally using the cached RSA public key.
 * No network call to auth-manager is made during normal operation.
 *
 * <p>If token validation fails with a {@link JwtException}, the validator automatically
 * refreshes the cached public key via {@link PublicKeyProvider#refresh()} and retries
 * once. This allows the service to self-heal after an auth-manager restart that
 * rotates the RSA key pair, without requiring a manual restart.</p>
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 2026-04-06
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class UserTokenValidator {

    private final PublicKeyProvider publicKeyProvider;

    /**
     * Parses and validates a user access token, returning a {@link UserPrincipal}
     * populated from the token's claims.
     *
     * <p>On a {@link JwtException} the public key cache is refreshed and the
     * validation is retried once before throwing a 401 response.</p>
     *
     * @param token the compact JWT string (without "Bearer " prefix)
     * @return a principal carrying the user ID and their single granted role
     * @throws org.springframework.web.server.ResponseStatusException 401 if the signature
     *         is invalid, token is expired, or the {@code type} claim is not {@code "ACCESS"}
     */
    public UserPrincipal validate(String token) {
        return doValidate(token, false);
    }

    private UserPrincipal doValidate(String token, boolean isRetry) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(publicKeyProvider.getPublicKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            String tokenType = claims.get("type", String.class);
            if (!"ACCESS".equals(tokenType)) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not an access token");
            }

            String userId = claims.get("userId", String.class);
            String role = claims.get("role", String.class);
            return new UserPrincipal(userId, role,
                    List.of(new SimpleGrantedAuthority("ROLE_" + role)));

        } catch (JwtException e) {
            if (!isRetry) {
                log.warn("User token validation failed, refreshing public key: {}", e.getMessage());
                publicKeyProvider.refresh();
                return doValidate(token, true);
            }
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid token: " + e.getMessage());
        }
    }
}

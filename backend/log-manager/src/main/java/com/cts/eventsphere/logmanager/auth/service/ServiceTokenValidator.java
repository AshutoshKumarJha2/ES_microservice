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
 * Validates RSA-signed service tokens locally using the cached public key.
 *
 * <p>No network call is made during validation — the RSA public key is fetched
 * once at startup by {@link PublicKeyProvider} and reused for all requests.</p>
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
public class ServiceTokenValidator {
    private final PublicKeyProvider publicKeyProvider;

    /**
     * Parses and validates a service token, returning a {@link UserPrincipal}
     * whose authorities contain all roles from the token's {@code roles} claim.
     *
     * <p>On a {@link JwtException} the public key cache is refreshed and the
     * validation is retried once before throwing a 401 response.</p>
     *
     * @param token the compact JWT string (without "Bearer " prefix)
     * @return a principal with {@code ROLE_SYSTEM} and {@code ROLE_SYS_*} authorities
     * @throws org.springframework.web.server.ResponseStatusException 401 if the signature
     *         is invalid, token is expired, or the {@code type} claim is not {@code "SERVICE"}
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
            if (!"SERVICE".equals(tokenType)) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not a service token");
            }

            String subject = claims.getSubject();
            @SuppressWarnings("unchecked")
            List<String> roles = claims.get("roles", List.class);
            List<SimpleGrantedAuthority> authorities = roles.stream()
                    .map(r -> new SimpleGrantedAuthority("ROLE_" + r))
                    .toList();
            return new UserPrincipal(subject, roles.getFirst(), authorities);

        } catch (JwtException e) {
            if (!isRetry) {
                log.warn("Service token validation failed, refreshing public key: {}", e.getMessage());
                publicKeyProvider.refresh();
                return doValidate(token, true);
            }
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                    "Invalid service token: " + e.getMessage());
        }
    }
}

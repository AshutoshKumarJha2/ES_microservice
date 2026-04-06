package com.cts.eventsphere.eventmanager.auth.service;

import com.cts.eventsphere.eventmanager.auth.dto.UserPrincipal;
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
import java.util.stream.Collectors;

/**
 * Validates RSA-signed service tokens locally using the cached public key.
 *
 * <p>No network call is made during validation — the RSA public key is fetched
 * once at startup by {@link PublicKeyProvider} and reused for all requests.</p>
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
     * @param token the compact JWT string (without "Bearer " prefix)
     * @return a principal with {@code ROLE_SYSTEM} and {@code ROLE_SYS_*} authorities
     * @throws ResponseStatusException 401 if the signature is invalid, token is expired,
     *                                 or the {@code type} claim is not {@code "SERVICE"}
     */
    public UserPrincipal validate(String token) {
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
                    .collect(Collectors.toList());

            return new UserPrincipal(subject, roles.get(0), authorities);

        } catch (JwtException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                    "Invalid service token: " + e.getMessage());
        }
    }
}

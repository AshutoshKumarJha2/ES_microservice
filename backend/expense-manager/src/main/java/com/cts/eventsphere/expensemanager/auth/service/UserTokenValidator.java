package com.cts.eventsphere.expensemanager.auth.service;

import com.cts.eventsphere.expensemanager.auth.dto.UserPrincipal;
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
 * No network call to auth-manager is made.
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

    public UserPrincipal validate(String token) {
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
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                    "Invalid token: " + e.getMessage());
        }
    }
}

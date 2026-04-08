package com.cts.eventsphere.iamservice.security;

import com.cts.eventsphere.iamservice.model.data.ServiceRoles;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.Jwts;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.List;

/**
 * Issues and signs RSA-256 service tokens on behalf of auth-manager.
 *
 * <p>Service tokens differ from user tokens in three ways:
 * <ul>
 *   <li>{@code type} claim is {@code "SERVICE"} (not {@code "ACCESS"} or {@code "REFRESH"})</li>
 *   <li>{@code roles} is a list: always contains {@link ServiceRoles#SYSTEM} plus the caller-specific role</li>
 *   <li>Signed with the RSA private key from {@link RsaKeyProvider} (not the HMAC secret)</li>
 * </ul>
 * </p>
 *
 * <p>Downstream services validate these tokens locally using the RSA public key
 * fetched from {@code GET /auth/service-token/public-key} at startup.</p>
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 2026-04-06
 */
@Component
@RequiredArgsConstructor
public class ServiceTokenUtil {

    private final RsaKeyProvider rsaKeyProvider;

    @Value("${service-token.expiration-in-m:1}")
    private long expirationMinutes;

    /**
     * Generates a short-lived RSA-signed service JWT.
     *
     * @param serviceName the name of the requesting service (embedded as JWT subject)
     * @param serviceRole the specific service role to embed alongside {@link ServiceRoles#SYSTEM}
     * @return a compact, signed JWT string
     */
    public String generateServiceToken(String serviceName, ServiceRoles serviceRole) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + expirationMinutes * 60 * 1000L);

        return Jwts.builder()
                .setSubject(serviceName)
                .claim("type", "SERVICE")
                .claim("roles", List.of(ServiceRoles.SYSTEM.name(), serviceRole.name()))
                .setIssuedAt(now)
                .setExpiration(exp)
                .signWith(rsaKeyProvider.getPrivateKey(), SignatureAlgorithm.RS256)
                .compact();
    }

    public long getExpirationSeconds() {
        return expirationMinutes * 60;
    }
}

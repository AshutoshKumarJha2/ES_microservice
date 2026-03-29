package com.cts.eventsphere.iamservice.security;

import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.List;

/**
 * Spring component that centralises all JWT operations for the Auth Manager service.
 *
 * <p>Responsibilities include:
 * <ul>
 *   <li>Building signed JWTs (both access and refresh tokens) with configurable expiration.</li>
 *   <li>Extracting claims (user ID, role) from a token.</li>
 *   <li>Validating token signatures and enforcing the expected {@link TokenType}.</li>
 *   <li>Constructing a {@link UserPrincipal} from a parsed token for use in the security context.</li>
 * </ul>
 * </p>
 *
 * <p>Uses HMAC-SHA256 signing via the {@code jwt.secret} application property.
 * Expiration times are controlled by {@code jwt.access.expiration-in-m} (minutes, default 15)
 * and {@code jwt.refresh.expiration-in-d} (days, default 7).</p>
 *
 * @author 2480010
 * @version 1.0
 * @since 25-03-2026
 */
@Component
public class JwtUtil {
    @Value("${jwt.secret:nvjfenvjnjv53352434rnnc19dnwqdneciu439jn}")
    private String SECRET_KEY;

    @Value("${jwt.access.expiration-in-m:15}")
    private  long ACCESS_EXPIRATION_TIME_IN_M; // Default to 15 minutes

    @Value("${jwt.refresh.expiration-in-d:7}")
    private long REFRESH_EXPIRATION_TIME_IN_D; // Default to 7 days

    /**
     * Derives the HMAC-SHA256 signing key from the configured secret string.
     *
     * @return the {@link SecretKey} used to sign and verify all JWTs
     */
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
    }

    /**
     * Builds a signed JWT for the given user, role, and token type.
     *
     * <p>Embeds the {@code userId}, {@code role}, and {@code type} as custom claims.
     * Access tokens expire after {@code jwt.access.expiration-in-m} minutes;
     * refresh tokens expire after {@code jwt.refresh.expiration-in-d} days.</p>
     *
     * @param userId the UUID of the user to embed in the token subject and {@code userId} claim
     * @param role   the role name to embed in the {@code role} claim
     * @param type   {@link TokenType#ACCESS} or {@link TokenType#REFRESH}
     * @return the compact, URL-safe JWT string
     */
    private String buildToken(String userId, String role, TokenType type) {
        var typeString = switch (type){
            case ACCESS -> "ACCESS";
            case REFRESH -> "REFRESH";
        };
        var expirationMillis = switch (type){
            case ACCESS -> ACCESS_EXPIRATION_TIME_IN_M * 60 * 1000;
            case REFRESH -> REFRESH_EXPIRATION_TIME_IN_D * 24 * 60 * 60 * 1000;
        };
        return Jwts.builder()
                .setSubject(userId)
                .claim("userId", userId)
//                .claim("email", email)
                .claim("role", role)
                .claim("type", typeString)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationMillis))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Extracts the user ID (JWT subject) from a token.
     *
     * @param token the compact JWT string to parse
     * @return the user ID stored in the token's {@code sub} claim
     * @throws io.jsonwebtoken.JwtException if the token is invalid or expired
     */
    public String extractUserId(String token) {
        return Jwts.parserBuilder().setSigningKey(getSigningKey()).build()
                .parseClaimsJws(token).getBody().getSubject();
    }

    /**
     * Extracts the role from a token's {@code role} claim.
     *
     * @param token the compact JWT string to parse
     * @return the role name (e.g. {@code "ADMIN"}) stored in the token
     * @throws io.jsonwebtoken.JwtException if the token is invalid or expired
     */
    public String extractRole(String token) {
        return Jwts.parserBuilder().setSigningKey(getSigningKey()).build()
                .parseClaimsJws(token).getBody().get("role", String.class);
    }

    /**
     * Validates a token's signature, expiration, and type.
     *
     * @param token        the compact JWT string to validate
     * @param expectedType the {@link TokenType} the token must carry in its {@code type} claim
     * @return {@code true} if the token is valid and matches {@code expectedType};
     *         {@code false} if the signature is wrong, the token is expired, or the type mismatches
     */
    public boolean validateToken(String token, TokenType expectedType) {
        try {
            var claims = Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(token);
            var tokenType = claims.getBody().get("type", String.class);
            return expectedType.name().equals(tokenType);
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    /**
     * Parses a token and constructs a {@link UserPrincipal} for use in the Spring Security context.
     *
     * <p>Throws {@link io.jsonwebtoken.JwtException} if the token type does not match
     * {@code expectedType}, preventing access tokens from being used on the refresh endpoint
     * and vice versa.</p>
     *
     * @param token        the compact JWT string to parse
     * @param expectedType the {@link TokenType} the token is required to carry
     * @return a {@link UserPrincipal} containing the user ID, role, and derived authorities
     * @throws io.jsonwebtoken.JwtException if the token is invalid, expired, or the type mismatches
     */
    UserPrincipal extractUserPrincipal(String token, TokenType expectedType) {
        var claims = Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(token);
        var tokenType = claims.getBody().get("type", String.class);
        if (!expectedType.name().equals(tokenType)) {
            throw new JwtException("Invalid token type. Expected: " + expectedType.name() + ", Found: " + tokenType);
        }
//        String email = claims.getBody().get("email", String.class);
        String role = claims.getBody().get("role", String.class);
        String userId = claims.getBody().get("userId", String.class);
        String roleAuthority = "ROLE_" + role.toUpperCase();
        return new UserPrincipal(userId, role, List.of(new SimpleGrantedAuthority(roleAuthority)));
    }

    /**
     * Generates a signed access token for the given user.
     *
     * @param userId the UUID of the user
     * @param role   the role name to embed in the token
     * @return a compact, signed JWT access token
     */
    public String generateAccessToken(String userId, String role) {
        return buildToken(userId, role, TokenType.ACCESS);
    }

    /**
     * Generates a signed refresh token for the given user.
     *
     * @param userId the UUID of the user
     * @param role   the role name to embed in the token
     * @return a compact, signed JWT refresh token
     */
    public String generateRefreshToken(String userId, String role) {
        return buildToken(userId, role, TokenType.REFRESH);
    }
}

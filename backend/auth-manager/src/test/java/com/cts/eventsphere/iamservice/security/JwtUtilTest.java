package com.cts.eventsphere.iamservice.security;

import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Collection;

import static org.assertj.core.api.Assertions.*;

/**
 * Unit tests for {@link JwtUtil}.
 *
 * <p>Covers token generation, claim extraction, type validation,
 * and principal extraction — including error paths.</p>
 *
 * @author 2480010
 * @version 1.0
 * @since 25-03-2026
 */
class JwtUtilTest {

    private JwtUtil jwtUtil;

    private static final String SECRET = "nvjfenvjnjv53352434rnnc19dnwqdneciu439jn";
    private static final String USER_ID = "user-abc-123";
    private static final String ROLE    = "ADMIN";

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "SECRET_KEY", SECRET);
        ReflectionTestUtils.setField(jwtUtil, "ACCESS_EXPIRATION_TIME_IN_M", 15L);
        ReflectionTestUtils.setField(jwtUtil, "REFRESH_EXPIRATION_TIME_IN_D", 7L);
    }

    // ─── generateAccessToken ───────────────────────────────────────────────────

    @Test
    void generateAccessToken_ShouldReturnNonEmptyToken() {
        String token = jwtUtil.generateAccessToken(USER_ID, ROLE);
        assertThat(token).isNotBlank();
    }

    // ─── generateRefreshToken ─────────────────────────────────────────────────

    @Test
    void generateRefreshToken_ShouldReturnNonEmptyToken() {
        String token = jwtUtil.generateRefreshToken(USER_ID, ROLE);
        assertThat(token).isNotBlank();
    }

    // ─── extractUserId ────────────────────────────────────────────────────────

    @Test
    void extractUserId_ShouldReturnCorrectUserId() {
        String token = jwtUtil.generateAccessToken(USER_ID, ROLE);
        assertThat(jwtUtil.extractUserId(token)).isEqualTo(USER_ID);
    }

    @Test
    void extractUserId_ShouldReturnCorrectUserIdFromRefreshToken() {
        String token = jwtUtil.generateRefreshToken(USER_ID, ROLE);
        assertThat(jwtUtil.extractUserId(token)).isEqualTo(USER_ID);
    }

    // ─── extractRole ──────────────────────────────────────────────────────────

    @Test
    void extractRole_ShouldReturnRoleEmbeddedInAccessToken() {
        String token = jwtUtil.generateAccessToken(USER_ID, ROLE);
        assertThat(jwtUtil.extractRole(token)).isEqualTo(ROLE);
    }

    @Test
    void extractRole_ShouldReturnRoleEmbeddedInRefreshToken() {
        String token = jwtUtil.generateRefreshToken(USER_ID, "ORGANIZER");
        assertThat(jwtUtil.extractRole(token)).isEqualTo("ORGANIZER");
    }

    // ─── validateToken ────────────────────────────────────────────────────────

    @Test
    void validateToken_AccessToken_WithAccessTypeExpected_ShouldReturnTrue() {
        String token = jwtUtil.generateAccessToken(USER_ID, ROLE);
        assertThat(jwtUtil.validateToken(token, TokenType.ACCESS)).isTrue();
    }

    @Test
    void validateToken_RefreshToken_WithRefreshTypeExpected_ShouldReturnTrue() {
        String token = jwtUtil.generateRefreshToken(USER_ID, ROLE);
        assertThat(jwtUtil.validateToken(token, TokenType.REFRESH)).isTrue();
    }

    @Test
    void validateToken_AccessToken_WithRefreshTypeExpected_ShouldReturnFalse() {
        String token = jwtUtil.generateAccessToken(USER_ID, ROLE);
        assertThat(jwtUtil.validateToken(token, TokenType.REFRESH)).isFalse();
    }

    @Test
    void validateToken_RefreshToken_WithAccessTypeExpected_ShouldReturnFalse() {
        String token = jwtUtil.generateRefreshToken(USER_ID, ROLE);
        assertThat(jwtUtil.validateToken(token, TokenType.ACCESS)).isFalse();
    }

    @Test
    void validateToken_WithGarbageString_ShouldReturnFalse() {
        assertThat(jwtUtil.validateToken("not.a.jwt", TokenType.ACCESS)).isFalse();
    }

    @Test
    void validateToken_WithEmptyString_ShouldReturnFalse() {
        assertThat(jwtUtil.validateToken("", TokenType.ACCESS)).isFalse();
    }

    // ─── extractUserPrincipal ─────────────────────────────────────────────────

    @Test
    void extractUserPrincipal_ValidAccessToken_ShouldReturnPrincipalWithCorrectFields() {
        String token = jwtUtil.generateAccessToken(USER_ID, ROLE);
        UserPrincipal principal = jwtUtil.extractUserPrincipal(token, TokenType.ACCESS);

        assertThat(principal.userId()).isEqualTo(USER_ID);
        assertThat(principal.role()).isEqualTo(ROLE);
        assertThat((Collection<GrantedAuthority>)principal.authorities())
                .containsExactly(new SimpleGrantedAuthority("ROLE_ADMIN"));
    }

    @Test
    void extractUserPrincipal_ValidRefreshToken_ShouldReturnPrincipalWithCorrectFields() {
        String token = jwtUtil.generateRefreshToken(USER_ID, "ATTENDEE");
        UserPrincipal principal = jwtUtil.extractUserPrincipal(token, TokenType.REFRESH);

        assertThat(principal.userId()).isEqualTo(USER_ID);
        assertThat(principal.role()).isEqualTo("ATTENDEE");
        assertThat((Collection<GrantedAuthority>)principal.authorities())
                .containsExactly(new SimpleGrantedAuthority("ROLE_ATTENDEE"));
    }

    @Test
    void extractUserPrincipal_AccessTokenWithRefreshTypeExpected_ShouldThrowJwtException() {
        String accessToken = jwtUtil.generateAccessToken(USER_ID, ROLE);

        assertThatThrownBy(() -> jwtUtil.extractUserPrincipal(accessToken, TokenType.REFRESH))
                .isInstanceOf(JwtException.class)
                .hasMessageContaining("Invalid token type");
    }

    @Test
    void extractUserPrincipal_RefreshTokenWithAccessTypeExpected_ShouldThrowJwtException() {
        String refreshToken = jwtUtil.generateRefreshToken(USER_ID, ROLE);

        assertThatThrownBy(() -> jwtUtil.extractUserPrincipal(refreshToken, TokenType.ACCESS))
                .isInstanceOf(JwtException.class)
                .hasMessageContaining("Invalid token type");
    }
}

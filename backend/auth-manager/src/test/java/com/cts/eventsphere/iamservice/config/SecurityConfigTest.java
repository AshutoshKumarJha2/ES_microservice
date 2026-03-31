package com.cts.eventsphere.iamservice.config;

import com.cts.eventsphere.iamservice.controller.AuthController;
import com.cts.eventsphere.iamservice.dto.auth.LoginResponseDto;
import com.cts.eventsphere.iamservice.security.JwtUtil;
import com.cts.eventsphere.iamservice.service.AuthService;
import com.cts.eventsphere.iamservice.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import org.springframework.context.annotation.Import;
import org.springframework.test.context.TestPropertySource;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Tests for {@link SecurityConfig}.
 *
 * <p>Uses {@code @WebMvcTest} to load the full security filter chain so that
 * both {@link SecurityConfig#passwordEncoder()} and
 * {@link SecurityConfig#securityFilterChain(org.springframework.security.config.annotation.web.builders.HttpSecurity)}
 * are exercised. Also verifies that {@code /auth/**} paths are publicly accessible
 * and non-public paths require authentication.</p>
 *
 * @author 2480010
 * @version 1.0
 * @since 25-03-2026
 */
@WebMvcTest(AuthController.class)
@Import(SecurityConfig.class)
@TestPropertySource(properties = {"spring.config.import="})
class SecurityConfigTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @MockitoBean
    private JwtUtil jwtUtil;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private UserService userService;

    // ─── passwordEncoder bean ─────────────────────────────────────────────────

    @Test
    void passwordEncoder_ShouldBeBCryptPasswordEncoder() {
        assertThat(passwordEncoder).isInstanceOf(BCryptPasswordEncoder.class);
    }

    @Test
    void passwordEncoder_ShouldEncodeAndMatchPasswords() {
        String raw = "testPassword";
        String encoded = passwordEncoder.encode(raw);
        assertThat(passwordEncoder.matches(raw, encoded)).isTrue();
    }

    // ─── Security filter chain: public paths ──────────────────────────────────

    @Test
    void authRegisterEndpoint_ShouldBeAccessibleWithoutAuthentication() throws Exception {
        LoginResponseDto loginResponse = new LoginResponseDto("access.token", "refresh.token", "Bearer");
        when(authService.login(any())).thenReturn(loginResponse);

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"alice@example.com\",\"password\":\"pass123\",\"role\":\"ATTENDEE\"}"))
                .andExpect(status().isOk());
    }

    // ─── Security filter chain: protected paths ───────────────────────────────

    @Test
    void nonAuthEndpoint_WithoutAuthentication_ShouldReturn4xx() throws Exception {
        // Spring Security returns 401 or 403 depending on entry-point configuration.
        // Without HTTP Basic or form-login, unauthenticated access to a protected path
        // results in a 4xx client error.
        mockMvc.perform(get("/users"))
                .andExpect(status().is4xxClientError());
    }
}

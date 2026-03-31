package com.cts.eventsphere.iamservice.auth;

import com.cts.eventsphere.iamservice.controller.AuthController;
import com.cts.eventsphere.iamservice.dto.auth.LoginRequestDto;
import com.cts.eventsphere.iamservice.dto.auth.LoginResponseDto;
import com.cts.eventsphere.iamservice.dto.auth.RegisterResponseDto;
import com.cts.eventsphere.iamservice.dto.auth.ValidateResponse;
import com.cts.eventsphere.iamservice.dto.user.UserRequestDto;
import com.cts.eventsphere.iamservice.dto.user.UserResponseDto;
import com.cts.eventsphere.iamservice.exception.GlobalExceptionHandler;
import com.cts.eventsphere.iamservice.model.data.UserRoles;
import com.cts.eventsphere.iamservice.model.data.UserStatus;
import com.cts.eventsphere.iamservice.security.UserPrincipal;
import com.cts.eventsphere.iamservice.service.AuthService;
import com.cts.eventsphere.iamservice.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Unit tests for {@link AuthController}.
 *
 * <p>Uses standalone MockMvc to isolate the controller and exercise each endpoint's
 * request/response mapping. The {@link GlobalExceptionHandler} is attached so
 * exception-to-status mappings are also exercised.</p>
 *
 * @author 2480010
 * @version 1.0
 * @since 25-03-2026
 */
@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private AuthService authService;

    @Mock
    private UserService userService;

    @InjectMocks
    private AuthController authController;

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(authController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    // ─── POST /auth/register ──────────────────────────────────────────────────

    @Test
    void register_ShouldReturn200WithRegisterResponseDto() throws Exception {
        UserRequestDto request = new UserRequestDto("Alice", "alice@example.com", "pass", "0987654321");
        RegisterResponseDto response = new RegisterResponseDto(
                "user-001", "Alice", "alice@example.com", "ATTENDEE",
                "0987654321", "ACTIVE", "User registered successfully with email: alice@example.com");

        when(authService.register(any(UserRequestDto.class))).thenReturn(response);

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userEmail").value("alice@example.com"))
                .andExpect(jsonPath("$.userName").value("Alice"))
                .andExpect(jsonPath("$.role").value("ATTENDEE"));
    }

    // ─── POST /auth/login ─────────────────────────────────────────────────────

    @Test
    void login_ShouldReturn200WithLoginResponseDto() throws Exception {
        LoginRequestDto request = new LoginRequestDto("pass123", "alice@example.com");
        LoginResponseDto response = new LoginResponseDto("access.token", "refresh.token", "Bearer");

        when(authService.login(any(LoginRequestDto.class))).thenReturn(response);

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("access.token"))
                .andExpect(jsonPath("$.refreshToken").value("refresh.token"))
                .andExpect(jsonPath("$.type").value("Bearer"));
    }

    // ─── POST /auth/refresh ───────────────────────────────────────────────────

    @Test
    void refreshToken_ShouldReturn200WithNewLoginResponseDto() throws Exception {
        UserPrincipal principal = new UserPrincipal("user-001", "ATTENDEE",
                List.of(new SimpleGrantedAuthority("ROLE_ATTENDEE")));
        LoginResponseDto response = new LoginResponseDto("new.access", "new.refresh", "Bearer");

        when(authService.refreshToken(any(UserPrincipal.class))).thenReturn(response);

        mockMvc.perform(post("/auth/refresh")
                        .with(SecurityMockMvcRequestPostProcessors.authentication(
                                new UsernamePasswordAuthenticationToken(
                                        principal, null, principal.authorities())))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("new.access"))
                .andExpect(jsonPath("$.refreshToken").value("new.refresh"));
    }

    // ─── GET /auth/validate ───────────────────────────────────────────────────

    @Test
    void validate_ShouldReturn200WithValidateResponse() throws Exception {
        ValidateResponse validateResponse = new ValidateResponse("user-001", "ADMIN");

        when(authService.validateToken("Bearer valid.token")).thenReturn(validateResponse);

        mockMvc.perform(get("/auth/validate")
                        .header("Authorization", "Bearer valid.token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value("user-001"))
                .andExpect(jsonPath("$.userRole").value("ADMIN"));
    }

    // ─── POST /auth/users/userdetails ─────────────────────────────────────────

    @Test
    void getUserDetails_ShouldReturn200WithListOfUserResponseDto() throws Exception {
        List<String> userIds = List.of("user-001", "user-002");
        List<UserResponseDto> responseList = List.of(
                new UserResponseDto("user-001", "Alice", UserRoles.ATTENDEE,
                        "alice@example.com", "0987654321", UserStatus.ACTIVE),
                new UserResponseDto("user-002", "Bob", UserRoles.ORGANIZER,
                        "bob@example.com", "1234567890", UserStatus.ACTIVE)
        );

        when(userService.getUsers(userIds)).thenReturn(responseList);

        mockMvc.perform(post("/auth/users/userdetails")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(userIds)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].userId").value("user-001"))
                .andExpect(jsonPath("$[1].userId").value("user-002"));
    }
}

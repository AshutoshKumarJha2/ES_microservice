package com.cts.eventsphere.iamservice.user;

import com.cts.eventsphere.iamservice.controller.UserController;
import com.cts.eventsphere.iamservice.dto.user.UserRequestDto;
import com.cts.eventsphere.iamservice.dto.user.UserResponseDto;
import com.cts.eventsphere.iamservice.exception.GlobalExceptionHandler;
import com.cts.eventsphere.iamservice.model.data.UserRoles;
import com.cts.eventsphere.iamservice.model.data.UserStatus;
import com.cts.eventsphere.iamservice.security.UserPrincipal;
import com.cts.eventsphere.iamservice.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.method.annotation.AuthenticationPrincipalArgumentResolver;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Unit tests for {@link UserController}.
 *
 * <p>Uses a combination of standalone MockMvc (for endpoints without Spring MVC argument
 * resolution issues) and direct method invocation (for endpoints with multiple
 * {@code @RequestBody} parameters, which is a known Spring MVC limitation).</p>
 *
 * <p>{@link AuthenticationPrincipalArgumentResolver} is registered so that
 * {@code @AuthenticationPrincipal UserPrincipal} injection works in the {@code /me} test.</p>
 *
 * @author 2480010
 * @version 1.0
 * @since 25-03-2026
 */
@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    @Mock
    private UserService userService;

    @InjectMocks
    private UserController userController;

    private MockMvc mockMvc;

    private static final UserResponseDto ALICE_DTO = new UserResponseDto(
            "user-001", "Alice", UserRoles.ATTENDEE, "alice@example.com", "0987654321", UserStatus.ACTIVE);

    private static final UserResponseDto BOB_DTO = new UserResponseDto(
            "user-002", "Bob", UserRoles.ORGANIZER, "bob@example.com", "1234567890", UserStatus.ACTIVE);

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(userController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .setCustomArgumentResolvers(new AuthenticationPrincipalArgumentResolver())
                .build();
    }

    // ─── GET /users ───────────────────────────────────────────────────────────

    @Test
    void getAllUsers_ShouldReturn200WithListOfUsers() throws Exception {
        when(userService.getAllUsers()).thenReturn(List.of(ALICE_DTO, BOB_DTO));

        mockMvc.perform(get("/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].userId").value("user-001"))
                .andExpect(jsonPath("$[1].userId").value("user-002"));
    }

    // ─── GET /users/{userId} — direct invocation (double @RequestBody limitation) ─

    @Test
    void getUserById_ShouldDelegateToServiceAndReturnDto() {
        when(userService.getUser("user-001")).thenReturn(ALICE_DTO);

        ResponseEntity<UserResponseDto> response = userController.getUserById("user-001");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(ALICE_DTO);
        verify(userService).getUser("user-001");
    }

    // ─── PUT /users/{userId} — direct invocation (double @RequestBody limitation) ─

    @Test
    void updateUserDetails_ShouldDelegateToServiceAndReturnUpdatedDto() {
        UserRequestDto updateRequest = new UserRequestDto("Alice Updated", null, null, "1112223333");
        when(userService.updateUserDetails("user-001", updateRequest)).thenReturn(ALICE_DTO);

        ResponseEntity<UserResponseDto> response =
                userController.updateUserDetails("user-001", updateRequest, any());

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(ALICE_DTO);
        verify(userService).updateUserDetails("user-001", updateRequest);
    }

    // ─── GET /me ──────────────────────────────────────────────────────────────

    @Test
    void getMyDetails_ShouldReturn200WithAuthenticatedUserDto() throws Exception {
        UserPrincipal principal = new UserPrincipal("user-001", "ATTENDEE",
                List.of(new SimpleGrantedAuthority("ROLE_ATTENDEE")));
        when(userService.getUser("user-001")).thenReturn(ALICE_DTO);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(principal, null, principal.authorities()));

        try {
            mockMvc.perform(get("/me"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.userId").value("user-001"))
                    .andExpect(jsonPath("$.name").value("Alice"));
        } finally {
            SecurityContextHolder.clearContext();
        }
    }

    // ─── PATCH /users/{userId}/status ─────────────────────────────────────────

    @Test
    void changeUserStatus_ShouldReturn200WithUpdatedStatusDto() throws Exception {
        UserResponseDto suspended = new UserResponseDto(
                "user-001", "Alice", UserRoles.ATTENDEE, "alice@example.com",
                "0987654321", UserStatus.SUSPENDED);
        when(userService.changeUserStatus("user-001", "SUSPENDED")).thenReturn(suspended);

        mockMvc.perform(patch("/users/user-001/status")
                        .param("status", "SUSPENDED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUSPENDED"));
    }

    // ─── PATCH /users/{userId}/role ───────────────────────────────────────────

    @Test
    void changeUserRole_ShouldReturn200WithUpdatedRoleDto() throws Exception {
        UserResponseDto promoted = new UserResponseDto(
                "user-001", "Alice", UserRoles.ADMIN, "alice@example.com",
                "0987654321", UserStatus.ACTIVE);
        when(userService.changeUserRole("user-001", "ADMIN")).thenReturn(promoted);

        mockMvc.perform(patch("/users/user-001/role")
                        .param("role", "ADMIN"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("ADMIN"));
    }
}

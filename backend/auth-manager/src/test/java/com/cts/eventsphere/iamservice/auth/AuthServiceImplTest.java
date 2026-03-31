package com.cts.eventsphere.iamservice.auth;

import com.cts.eventsphere.iamservice.dto.auth.LoginRequestDto;
import com.cts.eventsphere.iamservice.dto.auth.LoginResponseDto;
import com.cts.eventsphere.iamservice.dto.auth.RegisterResponseDto;
import com.cts.eventsphere.iamservice.dto.auth.ValidateResponse;
import com.cts.eventsphere.iamservice.dto.user.UserRequestDto;
import com.cts.eventsphere.iamservice.exception.user.InvalidPasswordException;
import com.cts.eventsphere.iamservice.exception.user.RefreshFailedException;
import com.cts.eventsphere.iamservice.exception.user.UserAlreadyExistsException;
import com.cts.eventsphere.iamservice.exception.user.UserNotActiveException;
import com.cts.eventsphere.iamservice.exception.user.UserNotFoundException;
import com.cts.eventsphere.iamservice.exception.user.UserSuspendedException;
import com.cts.eventsphere.iamservice.model.User;
import com.cts.eventsphere.iamservice.model.data.UserRoles;
import com.cts.eventsphere.iamservice.model.data.UserStatus;
import com.cts.eventsphere.iamservice.repository.UserRepository;
import com.cts.eventsphere.iamservice.security.JwtUtil;
import com.cts.eventsphere.iamservice.security.TokenType;
import com.cts.eventsphere.iamservice.security.UserPrincipal;
import com.cts.eventsphere.iamservice.service.impl.AuthServiceImpl;
import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for {@link AuthServiceImpl}.
 *
 * <p>Tests all branches of registration, login, token refresh,
 * and token validation using mocked dependencies.</p>
 *
 * @author 2480010
 * @version 1.0
 * @since 25-03-2026
 */
@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthServiceImpl authService;

    // ─── register ─────────────────────────────────────────────────────────────

    @Test
    void register_WithNewEmail_ShouldPersistUserAndReturnResponseDto() {
        UserRequestDto dto = new UserRequestDto("Alice", "alice@example.com", "secret", "0987654321");
        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("secret")).thenReturn("$2a$hashed");

        User savedUser = buildUser("user-001", "Alice", "alice@example.com",
                "0987654321", UserRoles.ATTENDEE, UserStatus.ACTIVE);
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        RegisterResponseDto result = authService.register(dto);

        assertThat(result).isNotNull();
        assertThat(result.userEmail()).isEqualTo("alice@example.com");
        assertThat(result.userName()).isEqualTo("Alice");
        assertThat(result.role()).isEqualTo("ATTENDEE");
        assertThat(result.userStatus()).isEqualTo("ACTIVE");
        assertThat(result.message()).contains("registered successfully");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_WithExistingEmail_ShouldThrowUserAlreadyExistsException() {
        UserRequestDto dto = new UserRequestDto("Bob", "existing@example.com", "pass", "1234567890");
        when(userRepository.findByEmail("existing@example.com")).thenReturn(Optional.of(new User()));

        assertThatThrownBy(() -> authService.register(dto))
                .isInstanceOf(UserAlreadyExistsException.class);
        verify(userRepository, never()).save(any());
    }

    // ─── login ────────────────────────────────────────────────────────────────

    @Test
    void login_WithValidCredentials_ShouldReturnAccessAndRefreshTokens() {
        LoginRequestDto dto = new LoginRequestDto("pass123", "alice@example.com", "ATTENDEE");
        User user = buildUser("user-001", "Alice", "alice@example.com",
                "0987654321", UserRoles.ATTENDEE, UserStatus.ACTIVE);
        user.setPassword("$2a$hashed");

        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("pass123", "$2a$hashed")).thenReturn(true);
        when(jwtUtil.generateAccessToken("user-001", "ATTENDEE")).thenReturn("access.token.value");
        when(jwtUtil.generateRefreshToken("user-001", "ATTENDEE")).thenReturn("refresh.token.value");

        LoginResponseDto result = authService.login(dto);

        assertThat(result.accessToken()).isEqualTo("access.token.value");
        assertThat(result.refreshToken()).isEqualTo("refresh.token.value");
        assertThat(result.type()).isEqualTo("Bearer");
    }

    @Test
    void login_WithUnregisteredEmail_ShouldThrowUserNotFoundException() {
        LoginRequestDto dto = new LoginRequestDto("pass", "ghost@example.com", "ATTENDEE");
        when(userRepository.findByEmail("ghost@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(dto))
                .isInstanceOf(UserNotFoundException.class);
    }

    @Test
    void login_WithWrongPassword_ShouldThrowInvalidPasswordException() {
        LoginRequestDto dto = new LoginRequestDto("wrong", "alice@example.com", "ATTENDEE");
        User user = buildUser("user-001", "Alice", "alice@example.com",
                "0987654321", UserRoles.ATTENDEE, UserStatus.ACTIVE);
        user.setPassword("$2a$hashed");

        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "$2a$hashed")).thenReturn(false);

        assertThatThrownBy(() -> authService.login(dto))
                .isInstanceOf(InvalidPasswordException.class);
    }

    // ─── refreshToken ─────────────────────────────────────────────────────────

    @Test
    void refreshToken_WithActiveUserAndMatchingRole_ShouldReturnNewTokenPair() {
        UserPrincipal principal = new UserPrincipal("user-001", "ATTENDEE",
                List.of(new SimpleGrantedAuthority("ROLE_ATTENDEE")));
        User user = buildUser("user-001", "Alice", "alice@example.com",
                "0987654321", UserRoles.ATTENDEE, UserStatus.ACTIVE);

        when(userRepository.findById("user-001")).thenReturn(Optional.of(user));
        when(jwtUtil.generateAccessToken("user-001", "ATTENDEE")).thenReturn("new.access");
        when(jwtUtil.generateRefreshToken("user-001", "ATTENDEE")).thenReturn("new.refresh");

        LoginResponseDto result = authService.refreshToken(principal);

        assertThat(result.accessToken()).isEqualTo("new.access");
        assertThat(result.refreshToken()).isEqualTo("new.refresh");
        assertThat(result.type()).isEqualTo("Bearer");
    }

    @Test
    void refreshToken_WhenUserNotFound_ShouldThrowUserNotFoundException() {
        UserPrincipal principal = new UserPrincipal("no-such-user", "ATTENDEE", List.of());
        when(userRepository.findById("no-such-user")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.refreshToken(principal))
                .isInstanceOf(UserNotFoundException.class);
    }

    @Test
    void refreshToken_WhenRoleChanged_ShouldThrowRefreshFailedException() {
        UserPrincipal principal = new UserPrincipal("user-001", "ATTENDEE", List.of());
        User user = buildUser("user-001", "Alice", "alice@example.com",
                "0987654321", UserRoles.ADMIN, UserStatus.ACTIVE); // role changed to ADMIN in DB

        when(userRepository.findById("user-001")).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> authService.refreshToken(principal))
                .isInstanceOf(RefreshFailedException.class);
    }

    @Test
    void refreshToken_WhenUserIsInactive_ShouldThrowUserNotActiveException() {
        UserPrincipal principal = new UserPrincipal("user-001", "ATTENDEE", List.of());
        User user = buildUser("user-001", "Alice", "alice@example.com",
                "0987654321", UserRoles.ATTENDEE, UserStatus.INACTIVE);

        when(userRepository.findById("user-001")).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> authService.refreshToken(principal))
                .isInstanceOf(UserNotActiveException.class);
    }

    @Test
    void refreshToken_WhenUserIsSuspended_ShouldThrowUserSuspendedException() {
        UserPrincipal principal = new UserPrincipal("user-001", "ATTENDEE", List.of());
        User user = buildUser("user-001", "Alice", "alice@example.com",
                "0987654321", UserRoles.ATTENDEE, UserStatus.SUSPENDED);

        when(userRepository.findById("user-001")).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> authService.refreshToken(principal))
                .isInstanceOf(UserSuspendedException.class);
    }

    // ─── validateToken ────────────────────────────────────────────────────────

    @Test
    void validateToken_WithValidBearerToken_ShouldReturnUserIdAndRole() {
        when(jwtUtil.validateToken("good.token", TokenType.ACCESS)).thenReturn(true);
        when(jwtUtil.extractUserId("good.token")).thenReturn("user-001");
        when(jwtUtil.extractRole("good.token")).thenReturn("ADMIN");

        ValidateResponse result = authService.validateToken("Bearer good.token");

        assertThat(result.userId()).isEqualTo("user-001");
        assertThat(result.userRole()).isEqualTo("ADMIN");
    }

    @Test
    void validateToken_WithNullHeader_ShouldThrowResponseStatusException() {
        assertThatThrownBy(() -> authService.validateToken(null))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Missing or invalid Authorization header");
    }

    @Test
    void validateToken_WithNonBearerHeader_ShouldThrowResponseStatusException() {
        assertThatThrownBy(() -> authService.validateToken("Basic dXNlcjpwYXNz"))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Missing or invalid Authorization header");
    }

    @Test
    void validateToken_WhenValidateReturnsFalse_ShouldThrowResponseStatusException() {
        when(jwtUtil.validateToken("bad.token", TokenType.ACCESS)).thenReturn(false);

        assertThatThrownBy(() -> authService.validateToken("Bearer bad.token"))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Invalid or expired token");
    }

    @Test
    void validateToken_WhenJwtUtilThrowsJwtException_ShouldThrowResponseStatusException() {
        when(jwtUtil.validateToken("corrupt.token", TokenType.ACCESS))
                .thenThrow(new JwtException("corrupted"));

        assertThatThrownBy(() -> authService.validateToken("Bearer corrupt.token"))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Invalid token");
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private User buildUser(String id, String name, String email,
                           String phone, UserRoles role, UserStatus status) {
        User user = new User();
        user.setUserId(id);
        user.setName(name);
        user.setEmail(email);
        user.setPhone(phone);
        user.setRole(role);
        user.setStatus(status);
        return user;
    }
}

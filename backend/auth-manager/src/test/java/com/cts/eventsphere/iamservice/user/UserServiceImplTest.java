package com.cts.eventsphere.iamservice.user;

import com.cts.eventsphere.iamservice.dto.user.UserRequestDto;
import com.cts.eventsphere.iamservice.dto.user.UserResponseDto;
import com.cts.eventsphere.iamservice.exception.user.EmailAlreadyExistsException;
import com.cts.eventsphere.iamservice.exception.user.UserNotFoundException;
import com.cts.eventsphere.iamservice.model.User;
import com.cts.eventsphere.iamservice.model.data.UserRoles;
import com.cts.eventsphere.iamservice.model.data.UserStatus;
import com.cts.eventsphere.iamservice.repository.UserRepository;
import com.cts.eventsphere.iamservice.service.impl.UserServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for {@link UserServiceImpl}.
 *
 * <p>Covers all CRUD and admin operations: list, fetch-by-id, bulk-fetch,
 * partial update, status change, and role change — including all error paths.</p>
 *
 * @author 2480010
 * @version 1.0
 * @since 25-03-2026
 */
@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository userRepo;

    @InjectMocks
    private UserServiceImpl userService;

    // ─── getAllUsers ───────────────────────────────────────────────────────────

    @Test
    void getAllUsers_ShouldReturnDtoListForAllUsers() {
        List<User> users = List.of(
                buildUser("u1", "Alice", "alice@e.com", UserRoles.ATTENDEE, UserStatus.ACTIVE),
                buildUser("u2", "Bob",   "bob@e.com",   UserRoles.ORGANIZER, UserStatus.ACTIVE)
        );
        when(userRepo.findAll()).thenReturn(users);

        List<UserResponseDto> result = userService.getAllUsers(any());

        assertThat(result).hasSize(2);
        assertThat(result.get(0).userId()).isEqualTo("u1");
        assertThat(result.get(1).userId()).isEqualTo("u2");
    }

    @Test
    void getAllUsers_WhenNoUsers_ShouldReturnEmptyList() {
        when(userRepo.findAll()).thenReturn(List.of());

        assertThat(userService.getAllUsers(any())).isEmpty();
    }

    // ─── getUsers (bulk) ──────────────────────────────────────────────────────

    @Test
    void getUsers_ShouldReturnDtosForGivenIds() {
        List<String> ids = List.of("u1", "u2");
        List<User> users = List.of(
                buildUser("u1", "Alice", "alice@e.com", UserRoles.ATTENDEE, UserStatus.ACTIVE),
                buildUser("u2", "Bob",   "bob@e.com",   UserRoles.ORGANIZER, UserStatus.ACTIVE)
        );
        when(userRepo.findAllById(ids)).thenReturn(users);

        List<UserResponseDto> result = userService.getUsers(ids);

        assertThat(result).hasSize(2);
        assertThat(result).extracting(UserResponseDto::userId).containsExactly("u1", "u2");
    }

    // ─── getUser ──────────────────────────────────────────────────────────────

    @Test
    void getUser_WithValidId_ShouldReturnCorrectDto() {
        User user = buildUser("u1", "Alice", "alice@e.com", UserRoles.ATTENDEE, UserStatus.ACTIVE);
        when(userRepo.findById("u1")).thenReturn(Optional.of(user));

        UserResponseDto result = userService.getUser("u1");

        assertThat(result.userId()).isEqualTo("u1");
        assertThat(result.name()).isEqualTo("Alice");
        assertThat(result.email()).isEqualTo("alice@e.com");
        assertThat(result.role()).isEqualTo(UserRoles.ATTENDEE);
        assertThat(result.status()).isEqualTo(UserStatus.ACTIVE);
    }

    @Test
    void getUser_WithUnknownId_ShouldThrowUserNotFoundException() {
        when(userRepo.findById("unknown")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.getUser("unknown"))
                .isInstanceOf(UserNotFoundException.class);
    }

    // ─── updateUserDetails ────────────────────────────────────────────────────

    @Test
    void updateUserDetails_WithNamePhoneAndPassword_ShouldApplyChangesAndReturn() {
        User existing = buildUser("u1", "Alice", "alice@e.com", UserRoles.ATTENDEE, UserStatus.ACTIVE);
        UserRequestDto dto = new UserRequestDto("Alice Updated", null, "newpass", "1112223333");

        when(userRepo.existsById("u1")).thenReturn(true);
        when(userRepo.findById("u1")).thenReturn(Optional.of(existing));
        when(userRepo.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        UserResponseDto result = userService.updateUserDetails("u1", dto);

        assertThat(result.name()).isEqualTo("Alice Updated");
        assertThat(result.phone()).isEqualTo("1112223333");
    }

    @Test
    void updateUserDetails_WithNewUniqueEmail_ShouldUpdateEmail() {
        User existing = buildUser("u1", "Alice", "alice@e.com", UserRoles.ATTENDEE, UserStatus.ACTIVE);
        UserRequestDto dto = new UserRequestDto(null, "newalice@e.com", null, null);

        when(userRepo.existsById("u1")).thenReturn(true);
        when(userRepo.findById("u1")).thenReturn(Optional.of(existing));
        when(userRepo.existsByEmail("newalice@e.com")).thenReturn(false);
        when(userRepo.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        UserResponseDto result = userService.updateUserDetails("u1", dto);

        assertThat(result.email()).isEqualTo("newalice@e.com");
    }

    @Test
    void updateUserDetails_WithSameEmail_ShouldNotTriggerUniquenessCheck() {
        User existing = buildUser("u1", "Alice", "alice@e.com", UserRoles.ATTENDEE, UserStatus.ACTIVE);
        UserRequestDto dto = new UserRequestDto(null, "alice@e.com", null, null); // same email

        when(userRepo.existsById("u1")).thenReturn(true);
        when(userRepo.findById("u1")).thenReturn(Optional.of(existing));
        when(userRepo.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        UserResponseDto result = userService.updateUserDetails("u1", dto);

        assertThat(result.email()).isEqualTo("alice@e.com");
        verify(userRepo, never()).existsByEmail(any());
    }

    @Test
    void updateUserDetails_WithDuplicateEmail_ShouldThrowEmailAlreadyExistsException() {
        User existing = buildUser("u1", "Alice", "alice@e.com", UserRoles.ATTENDEE, UserStatus.ACTIVE);
        UserRequestDto dto = new UserRequestDto(null, "taken@e.com", null, null);

        when(userRepo.existsById("u1")).thenReturn(true);
        when(userRepo.findById("u1")).thenReturn(Optional.of(existing));
        when(userRepo.existsByEmail("taken@e.com")).thenReturn(true);

        assertThatThrownBy(() -> userService.updateUserDetails("u1", dto))
                .isInstanceOf(EmailAlreadyExistsException.class);
        verify(userRepo, never()).save(any());
    }

    @Test
    void updateUserDetails_WithNonExistentUserId_ShouldThrowIllegalArgumentException() {
        when(userRepo.existsById("ghost")).thenReturn(false);
        UserRequestDto dto = new UserRequestDto("Name", null, null, null);

        assertThatThrownBy(() -> userService.updateUserDetails("ghost", dto))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("ghost");
    }

    @Test
    void updateUserDetails_WithBlankPassword_ShouldNotUpdatePassword() {
        User existing = buildUser("u1", "Alice", "alice@e.com", UserRoles.ATTENDEE, UserStatus.ACTIVE);
        existing.setPassword("$2a$existing");
        UserRequestDto dto = new UserRequestDto(null, null, "   ", null); // blank password

        when(userRepo.existsById("u1")).thenReturn(true);
        when(userRepo.findById("u1")).thenReturn(Optional.of(existing));
        when(userRepo.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        userService.updateUserDetails("u1", dto);

        assertThat(existing.getPassword()).isEqualTo("$2a$existing");
    }

    // ─── changeUserStatus ─────────────────────────────────────────────────────

    @Test
    void changeUserStatus_ToInactive_ShouldPersistAndReturnUpdatedDto() {
        User user = buildUser("u1", "Alice", "alice@e.com", UserRoles.ATTENDEE, UserStatus.ACTIVE);
        when(userRepo.findById("u1")).thenReturn(Optional.of(user));
        when(userRepo.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        UserResponseDto result = userService.changeUserStatus("u1", "INACTIVE");

        assertThat(result.status()).isEqualTo(UserStatus.INACTIVE);
    }

    @Test
    void changeUserStatus_ToSuspended_ShouldPersistAndReturnUpdatedDto() {
        User user = buildUser("u1", "Alice", "alice@e.com", UserRoles.ATTENDEE, UserStatus.ACTIVE);
        when(userRepo.findById("u1")).thenReturn(Optional.of(user));
        when(userRepo.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        UserResponseDto result = userService.changeUserStatus("u1", "SUSPENDED");

        assertThat(result.status()).isEqualTo(UserStatus.SUSPENDED);
    }

    @Test
    void changeUserStatus_WithUnknownUserId_ShouldThrowUserNotFoundException() {
        when(userRepo.findById("ghost")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.changeUserStatus("ghost", "ACTIVE"))
                .isInstanceOf(UserNotFoundException.class);
    }

    @Test
    void changeUserStatus_WithInvalidStatusString_ShouldThrowIllegalArgumentException() {
        User user = buildUser("u1", "Alice", "alice@e.com", UserRoles.ATTENDEE, UserStatus.ACTIVE);
        when(userRepo.findById("u1")).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> userService.changeUserStatus("u1", "UNKNOWN_STATUS"))
                .isInstanceOf(IllegalArgumentException.class);
    }

    // ─── changeUserRole ───────────────────────────────────────────────────────

    @Test
    void changeUserRole_ToAdmin_ShouldPersistAndReturnUpdatedDto() {
        User user = buildUser("u1", "Alice", "alice@e.com", UserRoles.ATTENDEE, UserStatus.ACTIVE);
        when(userRepo.findById("u1")).thenReturn(Optional.of(user));
        when(userRepo.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        UserResponseDto result = userService.changeUserRole("u1", "ADMIN");

        assertThat(result.role()).isEqualTo(UserRoles.ADMIN);
    }

    @Test
    void changeUserRole_WithUnknownUserId_ShouldThrowUserNotFoundException() {
        when(userRepo.findById("ghost")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.changeUserRole("ghost", "ADMIN"))
                .isInstanceOf(UserNotFoundException.class);
    }

    @Test
    void changeUserRole_WithInvalidRoleString_ShouldThrowIllegalArgumentException() {
        User user = buildUser("u1", "Alice", "alice@e.com", UserRoles.ATTENDEE, UserStatus.ACTIVE);
        when(userRepo.findById("u1")).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> userService.changeUserRole("u1", "SUPER_ADMIN"))
                .isInstanceOf(IllegalArgumentException.class);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private User buildUser(String id, String name, String email,
                           UserRoles role, UserStatus status) {
        User user = new User();
        user.setUserId(id);
        user.setName(name);
        user.setEmail(email);
        user.setPhone("0000000000");
        user.setRole(role);
        user.setStatus(status);
        return user;
    }
}

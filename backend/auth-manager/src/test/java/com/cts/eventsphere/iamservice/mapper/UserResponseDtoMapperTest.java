package com.cts.eventsphere.iamservice.mapper;

import com.cts.eventsphere.iamservice.dto.user.UserResponseDto;
import com.cts.eventsphere.iamservice.model.User;
import com.cts.eventsphere.iamservice.model.data.UserRoles;
import com.cts.eventsphere.iamservice.model.data.UserStatus;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.*;

/**
 * Unit tests for {@link UserResponseDtoMapper}.
 *
 * <p>Verifies that every field of the {@link User} entity is correctly
 * projected into a {@link UserResponseDto} and that sensitive fields
 * (password, timestamps) are excluded.</p>
 *
 * @author 2480010
 * @version 1.0
 * @since 25-03-2026
 */
class UserResponseDtoMapperTest {

    @Test
    void toDTO_ShouldMapAllPublicFieldsCorrectly() {
        User user = new User();
        user.setUserId("user-999");
        user.setName("Charlie");
        user.setEmail("charlie@example.com");
        user.setPhone("5559876543");
        user.setRole(UserRoles.VENDOR);
        user.setStatus(UserStatus.SUSPENDED);
        user.setPassword("$2a$shouldNotAppearInDto");

        UserResponseDto dto = UserResponseDtoMapper.toDTO(user);

        assertThat(dto.userId()).isEqualTo("user-999");
        assertThat(dto.name()).isEqualTo("Charlie");
        assertThat(dto.email()).isEqualTo("charlie@example.com");
        assertThat(dto.phone()).isEqualTo("5559876543");
        assertThat(dto.role()).isEqualTo(UserRoles.VENDOR);
        assertThat(dto.status()).isEqualTo(UserStatus.SUSPENDED);
    }

    @Test
    void toDTO_WithDefaultRoleAndStatus_ShouldReflectDefaults() {
        User user = new User();
        user.setUserId("user-000");
        user.setName("Dave");
        user.setEmail("dave@example.com");
        user.setPhone("1110002222");
        // role and status use field initializers: ATTENDEE and ACTIVE

        UserResponseDto dto = UserResponseDtoMapper.toDTO(user);

        assertThat(dto.role()).isEqualTo(UserRoles.ATTENDEE);
        assertThat(dto.status()).isEqualTo(UserStatus.ACTIVE);
    }
}

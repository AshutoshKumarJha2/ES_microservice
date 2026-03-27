package com.cts.eventsphere.iamservice.mapper;

import com.cts.eventsphere.iamservice.dto.user.UserResponseDto;
import com.cts.eventsphere.iamservice.model.User;
import org.springframework.stereotype.Component;

/**
 * Utility mapper that converts {@link User} JPA entities to {@link UserResponseDto} records.
 *
 * <p>Declared as a Spring {@code @Component} to participate in the application context, but all
 * methods are static so callers do not need to inject an instance.</p>
 *
 * @author 2480010
 * @version 1.0
 * @since 22-03-2026
 */
@Component
public class UserResponseDtoMapper {

    /**
     * Converts a {@link User} entity to a {@link UserResponseDto}, omitting sensitive fields
     * such as password and timestamps.
     *
     * @param user the {@link User} entity to convert; must not be {@code null}
     * @return a {@link UserResponseDto} populated with the user's public profile data
     */
    public static UserResponseDto toDTO(User user){
        return new UserResponseDto(
                user.getUserId(),
                user.getName(),
                user.getRole(),
                user.getEmail(),
                user.getPhone(),
                user.getStatus()
        );
    }

}

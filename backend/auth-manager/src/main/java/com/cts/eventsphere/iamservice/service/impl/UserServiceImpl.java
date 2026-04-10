package com.cts.eventsphere.iamservice.service.impl;

import com.cts.eventsphere.iamservice.dto.audit.AuditAction;
import com.cts.eventsphere.iamservice.dto.user.UserRequestDto;
import com.cts.eventsphere.iamservice.dto.user.UserResponseDto;
import com.cts.eventsphere.iamservice.exception.user.EmailAlreadyExistsException;
import com.cts.eventsphere.iamservice.exception.user.UserNotFoundException;
import com.cts.eventsphere.iamservice.mapper.UserResponseDtoMapper;
import com.cts.eventsphere.iamservice.model.User;
import com.cts.eventsphere.iamservice.model.data.UserRoles;
import com.cts.eventsphere.iamservice.model.data.UserStatus;
import com.cts.eventsphere.iamservice.repository.UserRepository;
import com.cts.eventsphere.iamservice.service.AuditService;
import com.cts.eventsphere.iamservice.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;

/**
 * Default implementation of {@link UserService} providing user management operations.
 *
 * <p>Supports listing all users, fetching a user by ID, partial profile updates
 * (name, email, phone, password), and administrative status/role changes.
 * Delegates persistence to {@link UserRepository} and mapping to
 * {@link com.cts.eventsphere.iamservice.mapper.UserResponseDtoMapper}.</p>
 *
 * @author 2480010
 * @version 1.0
 * @since 25-03-2026
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    /**
     * {@inheritDoc}
     *
     * <p>Fetches all {@link com.cts.eventsphere.iamservice.model.User} entities from the database
     * and maps each to a {@link UserResponseDto}.</p>
     */
    @Override
    public List<UserResponseDto> getAllUsers(String actorId) {
        List<User> userList = userRepo.findAll();
        return userList
                .stream()
                .peek(event -> auditService.logAudit(actorId, AuditAction.READ,User.class,event.getUserId()))
                .map(user -> UserResponseDtoMapper.toDTO(user)).toList();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public List<UserResponseDto> getUsers(List<String> userIds) {
        return userRepo.findAllById(userIds).stream()
                .map(UserResponseDtoMapper::toDTO)
                .toList();
    }

    @Override
    public UserResponseDto getUser(String userId) {
        User user =userRepo.findById(userId).orElseThrow(()->new UserNotFoundException(userId));
        auditService.logAudit(userId,AuditAction.READ,User.class,userId);
        return UserResponseDtoMapper.toDTO(user);
    }

    /**
     * {@inheritDoc}
     *
     * <p>Each field is updated only if the corresponding value in {@code userRequestDto}
     * is non-null. Email uniqueness is verified before applying a change. Password hashing
     * is currently a placeholder — replace the assignment with a BCrypt encoder call.</p>
     */
    @Override
    public UserResponseDto updateUserDetails(String userId, UserRequestDto userRequestDto) {
        User user = userRepo.findById(userId).orElseThrow(()->new UserNotFoundException(userId));


        if (userRequestDto.email() != null && !userRequestDto.email().equalsIgnoreCase(user.getEmail())) {
            if (userRepo.existsByEmail(userRequestDto.email())) {
                throw new EmailAlreadyExistsException(userRequestDto.email());
            }
            user.setEmail(userRequestDto.email());
        }

        if (userRequestDto.name() != null) user.setName(userRequestDto.name());
        if (userRequestDto.phone() != null) user.setPhone(userRequestDto.phone());

        if (userRequestDto.password() != null && !userRequestDto.password().isBlank()) {
            String hashed = passwordEncoder.encode(userRequestDto.password());
            user.setPassword(hashed);
        }

        User saved = userRepo.save(user);
        auditService.logAudit(user.getUserId(),AuditAction.UPDATE,User.class,saved.getUserId());
        return UserResponseDtoMapper.toDTO(saved);
    }

    /**
     * {@inheritDoc}
     *
     * <p>Parses {@code status} via {@link UserStatus#valueOf(String)}; throws
     * {@link IllegalArgumentException} for unrecognised values.</p>
     */
    @Override
    public UserResponseDto changeUserStatus(String userId, String status) {
        User user = userRepo.findById(userId).orElseThrow(() -> new UserNotFoundException(userId));
        String enumStatus = String.valueOf(UserStatus.valueOf(status));
        user.setStatus(UserStatus.valueOf(enumStatus));
        auditService.logAudit(user.getUserId(),AuditAction.UPDATE,User.class,userId);
        return UserResponseDtoMapper.toDTO(userRepo.save(user));
    }

    /**
     * {@inheritDoc}
     *
     * <p>After persisting the role change, a notification log entry is attempted.
     * Any failure during notification is caught and logged at ERROR level without
     * interrupting the response.</p>
     */
    @Override
    public UserResponseDto changeUserRole(String userId, String role) {
        User user = userRepo.findById(userId).orElseThrow(() -> new UserNotFoundException(userId));
        log.info("changing user role to {} for {}",  role, userId);
        UserRoles newRole = UserRoles.valueOf(role);
        user.setRole(newRole);
        User updatedUser = userRepo.save(user);
        log.info("changing user role to {} for {}",  newRole.name(), userId);
        auditService.logAudit(userId,AuditAction.UPDATE,User.class,updatedUser.getUserId());
        try{
            String message = "Your role has been changed to " + newRole;
//            notificationService.sendNotification(userId, message, "INFO");
            log.info("Role change notification queued for user: {}", userId);
        }
        catch (Exception e){
            log.error("Failed to send notification for role change to {} : {}", userId, e.getMessage());
        }
        return UserResponseDtoMapper.toDTO(updatedUser);
    }
}

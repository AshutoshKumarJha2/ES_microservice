package com.cts.eventsphere.logmanager.service.impl;

import com.cts.eventsphere.logmanager.dto.audit.AuditListResponseDTO;
import com.cts.eventsphere.logmanager.dto.audit.AuditLogRequestDTO;
import com.cts.eventsphere.logmanager.dto.mapper.auditlog.AuditLogMapper;
import com.cts.eventsphere.logmanager.model.AuditLog;
import com.cts.eventsphere.logmanager.model.data.AuditAction;
import com.cts.eventsphere.logmanager.repository.AuditLogRepository;
import com.cts.eventsphere.logmanager.repository.AuditLogSpecification;
import com.cts.eventsphere.logmanager.service.AuditService;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * AuditServiceImpl provides the concrete implementation of the {@link AuditService}.
 * It handles the persistence of audit logs and facilitates paginated retrieval
 * of system activities for administrative oversight.
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 2026-03-08
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuditServiceImpl implements AuditService {
    private final AuditLogRepository auditRepo;
    private final EntityManager entityManager;

    /**
     * Persists a new audit log entry.
     * Uses a proxy reference for the User entity to optimize performance.
     *
     * @param userId The unique identifier of the user performing the action.
     * @param dto    The user requested dto
     */
    @Override
    public void logAudit(String userId, AuditLogRequestDTO dto) {
        var auditLog = AuditLogMapper.fromDTO(dto, userId);

        log.debug("Initiating audit log creation - User: {}, Action: {}, Entity: {}, EntityId: {}",
                userId, auditLog.getAction(), auditLog.getEntityName(), auditLog.getEntityId());

        auditRepo.save(auditLog);
        log.info("Successfully saved audit log for EntityId: {}", auditLog.getEntityId());
    }

    /**
     * Fetches a paginated list of audit records and maps them to DTOs.
     *
     * @param size The number of records per page.
     * @param page The page number to retrieve.
     * @return A {@link AuditListResponseDTO} containing paginated audit data and metadata.
     */
    @Override
    public AuditListResponseDTO getAudits(int size, int page, String search, String action) {
        var pageable = PageRequest.of(page, size, Sort.by("timeStamp").descending());
        var spec = AuditLogSpecification.builder().search(search).action(action).build();
        var pages = auditRepo.findAll(spec, pageable);
        var audits = pages.stream().map(AuditLogMapper::toDTO).toList();

        var pageNo = pages.getNumber();
        var pageSize = pages.getSize();
        var totalElements = pages.getTotalElements();
        var totalPages = pages.getTotalPages();

        log.info("Fetched {} audits, page: {}, size: {}, search: '{}', action: '{}'", audits.size(), page, size, search, action);
        return new AuditListResponseDTO(
                audits,
                pageNo,
                pageSize,
                totalElements,
                totalPages
        );
    }
}
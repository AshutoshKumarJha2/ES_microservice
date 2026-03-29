package com.cts.eventsphere.logmanager.dto.mapper.auditlog;


import com.cts.eventsphere.logmanager.dto.audit.AuditLogRequestDTO;
import com.cts.eventsphere.logmanager.dto.audit.AuditResponseDTO;
import com.cts.eventsphere.logmanager.model.AuditLog;

import java.time.LocalDateTime;

/**
 * AuditLogMapper is a utility class responsible for mapping AuditLog entities
 * to their respective Data Transfer Objects (DTOs).
 * * This class facilitates the decoupling of the internal database schema from
 * the external API responses.
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 2026-03-08
 */
public class AuditLogMapper {

    /**
     * Converts an {@link AuditLog} entity into an {@link AuditResponseDTO}.
     * This method extracts user details and action metadata to provide a
     * flattened view for API consumers.
     *
     * @param audit The source {@link AuditLog} entity to be converted.
     * @return A constructed {@link AuditResponseDTO} containing the audit details.
     */
    public static AuditResponseDTO toDTO(AuditLog audit){
        return AuditResponseDTO.builder()
                .auditId(audit.getAuditId())
                .userId(audit.getUserId())
                .action(audit.getAction())
                .entityId(audit.getEntityId())
                .entityName(audit.getEntityName())
                .build();
    }

    /**
     * Helper method to create audit log object from dto
     *
     * @param dto the service request dto
     * @param actorId the user who is requesting
     * @return {@link AuditLog}
     */
    public static AuditLog fromDTO(AuditLogRequestDTO dto, String actorId){
        return AuditLog.builder()
                .userId(actorId)
                .action(dto.action().name())
                .entityId(dto.entityId())
                .entityName(dto.entityName())
                .build();

    }
}
package com.cts.eventsphere.logmanager.dto.mapper;

import com.cts.eventsphere.logmanager.dto.audit.AuditLogRequestDTO;
import com.cts.eventsphere.logmanager.dto.audit.AuditResponseDTO;
import com.cts.eventsphere.logmanager.dto.mapper.auditlog.AuditLogMapper;
import com.cts.eventsphere.logmanager.model.AuditLog;
import com.cts.eventsphere.logmanager.model.data.AuditAction;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class AuditLogMapperTest {

    // =========================================================================
    // AuditLogMapper.toDTO
    // =========================================================================
    @Nested
    @DisplayName("AuditLogMapper.toDTO(AuditLog)")
    class ToDTOTests {

        @Test
        @DisplayName("maps all AuditLog fields to AuditResponseDTO correctly")
        void toDTO_mapsAllFields() {
            LocalDateTime timestamp = LocalDateTime.of(2026, 3, 30, 12, 0);
            AuditLog auditLog = AuditLog.builder()
                    .auditId("audit-001")
                    .userId("user-001")
                    .action(AuditAction.CREATE.name())
                    .entityId("entity-001")
                    .entityName("Event")
                    .timeStamp(timestamp)
                    .build();

            AuditResponseDTO dto = AuditLogMapper.toDTO(auditLog);

            assertThat(dto.auditId()).isEqualTo("audit-001");
            assertThat(dto.userId()).isEqualTo("user-001");
            assertThat(dto.action()).isEqualTo("CREATE");
            assertThat(dto.entityId()).isEqualTo("entity-001");
            assertThat(dto.entityName()).isEqualTo("Event");
        }

        @Test
        @DisplayName("maps AuditLog with different action (DELETE)")
        void toDTO_deleteAction_mapsCorrectly() {
            AuditLog auditLog = AuditLog.builder()
                    .auditId("audit-002")
                    .userId("user-002")
                    .action(AuditAction.DELETE.name())
                    .entityId("reg-001")
                    .entityName("Registration")
                    .build();

            AuditResponseDTO dto = AuditLogMapper.toDTO(auditLog);

            assertThat(dto.action()).isEqualTo("DELETE");
            assertThat(dto.entityName()).isEqualTo("Registration");
        }
    }

    // =========================================================================
    // AuditLogMapper.fromDTO
    // =========================================================================
    @Nested
    @DisplayName("AuditLogMapper.fromDTO(AuditLogRequestDTO, actorId)")
    class FromDTOTests {

        @Test
        @DisplayName("maps DTO and actorId to AuditLog entity with correct fields")
        void fromDTO_mapsAllFields() {
            AuditLogRequestDTO dto = new AuditLogRequestDTO(AuditAction.UPDATE, "entity-003", "Schedule");

            AuditLog auditLog = AuditLogMapper.fromDTO(dto, "actor-001");

            assertThat(auditLog.getUserId()).isEqualTo("actor-001");
            assertThat(auditLog.getAction()).isEqualTo(AuditAction.UPDATE.name());
            assertThat(auditLog.getEntityId()).isEqualTo("entity-003");
            assertThat(auditLog.getEntityName()).isEqualTo("Schedule");
        }

        @Test
        @DisplayName("action is stored as string name (not enum ordinal)")
        void fromDTO_actionStoredAsName() {
            AuditLogRequestDTO dto = new AuditLogRequestDTO(AuditAction.ACCESS_DENIED, "entity-004", "Request");

            AuditLog auditLog = AuditLogMapper.fromDTO(dto, "actor-002");

            assertThat(auditLog.getAction()).isEqualTo("ACCESS_DENIED");
        }
    }
}

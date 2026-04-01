package com.cts.eventsphere.logmanager.service;

import com.cts.eventsphere.logmanager.dto.audit.AuditListResponseDTO;
import com.cts.eventsphere.logmanager.dto.audit.AuditLogRequestDTO;
import com.cts.eventsphere.logmanager.dto.audit.AuditResponseDTO;
import com.cts.eventsphere.logmanager.model.AuditLog;
import com.cts.eventsphere.logmanager.model.data.AuditAction;
import com.cts.eventsphere.logmanager.repository.AuditLogRepository;
import com.cts.eventsphere.logmanager.service.impl.AuditServiceImpl;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuditServiceImplTest {

    @Mock private AuditLogRepository auditRepo;
    @Mock private EntityManager entityManager;
    @InjectMocks private AuditServiceImpl auditService;

    private static final String USER_ID = "user-001";
    private AuditLog sampleAuditLog;
    private AuditLogRequestDTO sampleDto;

    @BeforeEach
    void setUp() {
        sampleDto = new AuditLogRequestDTO(AuditAction.CREATE, "entity-001", "Event");

        sampleAuditLog = AuditLog.builder()
                .auditId("audit-001")
                .userId(USER_ID)
                .action(AuditAction.CREATE.name())
                .entityId("entity-001")
                .entityName("Event")
                .timeStamp(LocalDateTime.now())
                .build();
    }

    // -------------------------------------------------------------------------
    // logAudit
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("logAudit(userId, dto)")
    class LogAudit {

        @Test
        @DisplayName("happy path – saves audit log and does not throw")
        void logAudit_happyPath_savesLog() {
            when(auditRepo.save(any(AuditLog.class))).thenReturn(sampleAuditLog);

            auditService.logAudit(USER_ID, sampleDto);

            verify(auditRepo).save(any(AuditLog.class));
        }

        @Test
        @DisplayName("saves audit log with correct userId and action from dto")
        void logAudit_mapsFieldsCorrectly() {
            auditService.logAudit(USER_ID, sampleDto);

            verify(auditRepo).save(argThat(log ->
                    USER_ID.equals(log.getUserId()) &&
                    AuditAction.CREATE.name().equals(log.getAction()) &&
                    "entity-001".equals(log.getEntityId()) &&
                    "Event".equals(log.getEntityName())
            ));
        }
    }

    // -------------------------------------------------------------------------
    // getAudits
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("getAudits(size, page)")
    class GetAudits {

        @Test
        @DisplayName("happy path – returns paginated AuditListResponseDTO with correct metadata")
        void getAudits_happyPath_returnsList() {
            var page = new PageImpl<>(List.of(sampleAuditLog), PageRequest.of(0, 10), 1);
            when(auditRepo.findAll(any(PageRequest.class))).thenReturn(page);

            AuditListResponseDTO result = auditService.getAudits(10, 0);

            assertThat(result.audits()).hasSize(1);
            assertThat(result.page()).isEqualTo(0);
            assertThat(result.size()).isEqualTo(10);
            assertThat(result.totalElements()).isEqualTo(1L);
            assertThat(result.totalPages()).isEqualTo(1);
        }

        @Test
        @DisplayName("happy path – returns empty list when no audits exist")
        void getAudits_empty_returnsEmptyList() {
            var emptyPage = new PageImpl<AuditLog>(List.of(), PageRequest.of(0, 10), 0);
            when(auditRepo.findAll(any(PageRequest.class))).thenReturn(emptyPage);

            AuditListResponseDTO result = auditService.getAudits(10, 0);

            assertThat(result.audits()).isEmpty();
            assertThat(result.totalElements()).isEqualTo(0L);
        }

        @Test
        @DisplayName("maps audit log fields to AuditResponseDTO correctly")
        void getAudits_mapsFieldsCorrectly() {
            var page = new PageImpl<>(List.of(sampleAuditLog), PageRequest.of(0, 10), 1);
            when(auditRepo.findAll(any(PageRequest.class))).thenReturn(page);

            AuditListResponseDTO result = auditService.getAudits(10, 0);

            AuditResponseDTO dto = result.audits().getFirst();
            assertThat(dto.auditId()).isEqualTo("audit-001");
            assertThat(dto.userId()).isEqualTo(USER_ID);
            assertThat(dto.action()).isEqualTo(AuditAction.CREATE.name());
            assertThat(dto.entityId()).isEqualTo("entity-001");
            assertThat(dto.entityName()).isEqualTo("Event");
        }
    }
}

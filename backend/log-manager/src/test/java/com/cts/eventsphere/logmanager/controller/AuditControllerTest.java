package com.cts.eventsphere.logmanager.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.cts.eventsphere.logmanager.auth.dto.UserPrincipal;
import com.cts.eventsphere.logmanager.dto.audit.AuditListResponseDTO;
import com.cts.eventsphere.logmanager.dto.audit.AuditLogRequestDTO;
import com.cts.eventsphere.logmanager.dto.audit.AuditResponseDTO;
import com.cts.eventsphere.logmanager.exception.GlobalExceptionHandler;
import com.cts.eventsphere.logmanager.model.data.AuditAction;
import com.cts.eventsphere.logmanager.service.AuditService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.method.annotation.AuthenticationPrincipalArgumentResolver;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AuditControllerTest {

    @Mock private AuditService auditService;
    @InjectMocks private AuditController auditController;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    private static final String USER_ID = "user-001";

    private AuditResponseDTO sampleAudit;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();

        mockMvc = MockMvcBuilders
                .standaloneSetup(auditController)
                .setCustomArgumentResolvers(new AuthenticationPrincipalArgumentResolver())
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        var principal = new UserPrincipal(USER_ID, "ADMIN",
                List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(principal, null, principal.authorities()));

        sampleAudit = AuditResponseDTO.builder()
                .auditId("audit-001")
                .userId(USER_ID)
                .action(AuditAction.CREATE.name())
                .entityId("entity-001")
                .entityName("Event")
                .timeStamp(LocalDateTime.now())
                .build();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    // -------------------------------------------------------------------------
    // GET /audits
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("GET /audits")
    class GetAllAudits {

        @Test
        @DisplayName("happy path – returns 200 with paginated audit list")
        void getAllAudits_happyPath_returns200() throws Exception {
            var response = new AuditListResponseDTO(List.of(sampleAudit), 0, 10, 1L, 1);
            when(auditService.getAudits(10, 0)).thenReturn(response);

            mockMvc.perform(get("/audits")
                            .param("size", "10")
                            .param("page", "0"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.totalElements").value(1))
                    .andExpect(jsonPath("$.audits[0].auditId").value("audit-001"))
                    .andExpect(jsonPath("$.audits[0].action").value("CREATE"));
        }

        @Test
        @DisplayName("happy path – returns 200 with empty list when no audits exist")
        void getAllAudits_empty_returns200WithEmptyList() throws Exception {
            var emptyResponse = new AuditListResponseDTO(List.of(), 0, 10, 0L, 0);
            when(auditService.getAudits(10, 0)).thenReturn(emptyResponse);

            mockMvc.perform(get("/audits")
                            .param("size", "10")
                            .param("page", "0"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.totalElements").value(0))
                    .andExpect(jsonPath("$.audits").isEmpty());
        }

        @Test
        @DisplayName("uses default pagination (size=10, page=0) when no params provided")
        void getAllAudits_defaultParams_usesDefaults() throws Exception {
            var response = new AuditListResponseDTO(List.of(), 0, 10, 0L, 0);
            when(auditService.getAudits(10, 0)).thenReturn(response);

            mockMvc.perform(get("/audits"))
                    .andExpect(status().isOk());

            verify(auditService).getAudits(10, 0);
        }
    }

    // -------------------------------------------------------------------------
    // POST /audits
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("POST /audits")
    class CreateAudit {

        @Test
        @DisplayName("happy path – returns 201 with success message")
        void createAudit_happyPath_returns201() throws Exception {
            AuditLogRequestDTO dto = new AuditLogRequestDTO(AuditAction.CREATE, "entity-001", "Event");
            doNothing().when(auditService).logAudit(eq(USER_ID), any(AuditLogRequestDTO.class));

            mockMvc.perform(post("/audits")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(dto)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.message").value("Success"));

            verify(auditService).logAudit(eq(USER_ID), any(AuditLogRequestDTO.class));
        }

        @Test
        @DisplayName("happy path – different actions are accepted (UPDATE, DELETE)")
        void createAudit_differentActions_returns201() throws Exception {
            AuditLogRequestDTO dto = new AuditLogRequestDTO(AuditAction.DELETE, "entity-002", "Registration");
            doNothing().when(auditService).logAudit(eq(USER_ID), any(AuditLogRequestDTO.class));

            mockMvc.perform(post("/audits")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(dto)))
                    .andExpect(status().isCreated());
        }
    }
}

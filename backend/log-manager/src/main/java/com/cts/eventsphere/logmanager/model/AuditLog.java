package com.cts.eventsphere.logmanager.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Audit log model class
 * * @author 2480010
 *
 * @version 1.0
 * @since 28-02-2026
 */

@Entity
@Table(name = "auditlog")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name="auditId", columnDefinition = "CHAR(36)")
    private String auditId;

    @Column(name="userId", columnDefinition = "CHAR(36)")
    private String userId;

    @Column(nullable = false, length = 100)
    private String action;

    @Column(nullable = false, length = 100)
    private String entityId;

    @Column(nullable = false, length = 100)
    private String entityName;

    @Column(nullable = false)
    @CreationTimestamp
    private LocalDateTime timeStamp;

    @CreationTimestamp
    @Column(updatable  = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

}

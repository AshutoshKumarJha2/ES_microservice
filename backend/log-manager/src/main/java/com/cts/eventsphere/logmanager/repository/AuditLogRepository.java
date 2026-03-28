package com.cts.eventsphere.logmanager.repository;

import com.cts.eventsphere.logmanager.model.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * JPA repository for AuditLog entity
 * * @author 2480010
 *
 * @version 1.0
 * @since 28-02-2026
 */

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, String> {
}

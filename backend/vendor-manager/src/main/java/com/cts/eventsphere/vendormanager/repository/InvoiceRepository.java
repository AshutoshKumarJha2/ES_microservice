package com.cts.eventsphere.vendormanager.repository;

import com.cts.eventsphere.vendormanager.model.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, String> {
    Optional<Invoice> findByContractId(String contractId);
}

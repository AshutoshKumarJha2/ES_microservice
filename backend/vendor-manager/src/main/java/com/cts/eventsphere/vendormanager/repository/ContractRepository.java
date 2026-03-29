package com.cts.eventsphere.vendormanager.repository;

import com.cts.eventsphere.vendormanager.model.Contract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ContractRepository extends JpaRepository<Contract, String> {
}

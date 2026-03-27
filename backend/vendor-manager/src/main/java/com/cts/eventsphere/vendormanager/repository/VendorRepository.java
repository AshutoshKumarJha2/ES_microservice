package com.cts.eventsphere.vendormanager.repository;

import com.cts.eventsphere.vendormanager.model.Vendor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VendorRepository extends JpaRepository<Vendor,String> {
}

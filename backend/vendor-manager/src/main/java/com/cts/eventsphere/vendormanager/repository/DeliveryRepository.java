package com.cts.eventsphere.vendormanager.repository;

import com.cts.eventsphere.vendormanager.model.Delivery;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DeliveryRepository extends JpaRepository<Delivery, String> {
}

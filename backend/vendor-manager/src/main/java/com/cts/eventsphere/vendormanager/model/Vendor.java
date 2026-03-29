package com.cts.eventsphere.vendormanager.model;


import com.cts.eventsphere.vendormanager.model.data.VendorStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "vendor")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vendor {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "vendorId", columnDefinition = "CHAR(36)")
    private String vendorId;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 100)
    private String contactInfo;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "ENUM('ACTIVE','INACTIVE','BLACKLISTED')")
    private VendorStatus status = VendorStatus.ACTIVE;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "vendor")
    private List<Contract> contracts = new ArrayList<>();
}

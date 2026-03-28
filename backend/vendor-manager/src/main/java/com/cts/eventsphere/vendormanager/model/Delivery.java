package com.cts.eventsphere.vendormanager.model;


import com.cts.eventsphere.vendormanager.model.data.DeliveryStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "delivery")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Delivery {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "deliveryId", columnDefinition = "CHAR(36)")
    private String deliveryId;

    @Column(name = "invoiceId", columnDefinition = "CHAR(36)",  nullable = false)
    private String invoiceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoiceId", insertable = false, updatable = false)
    private Invoice invoice;

    @Column(length = 100, nullable = false)
    private String item;

    @Column(nullable = false)
    private Integer quantity;

    private LocalDateTime deliveryDate;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "ENUM('SCHEDULED','IN_TRANSIT','DELIVERED','FAILED','CANCELLED')")
    private DeliveryStatus status = DeliveryStatus.SCHEDULED;

    @Column(length = 100)
    private String trackingNumber;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
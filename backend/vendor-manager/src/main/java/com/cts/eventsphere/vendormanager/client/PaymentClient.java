package com.cts.eventsphere.vendormanager.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "payment-service")
public interface PaymentClient {
    @GetMapping("/api/v1/payments/status/{transactionId}")
    String getPaymentStatus(@PathVariable("transactionId") String transactionId);
}
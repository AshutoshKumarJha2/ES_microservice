package com.cts.eventsphere.vendormanager.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "expense-manager")
public interface PaymentClient {
    @GetMapping("/payments/{paymentId}/status")
    String getPaymentStatus(@PathVariable("paymentId") String paymentId);
}
package com.cts.eventsphere.vendormanager.client;

import com.cts.eventsphere.vendormanager.config.ServiceFeignConfig;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "expense-manager", configuration = ServiceFeignConfig.class)
public interface PaymentClient {
    @GetMapping("/payments/{paymentId}/status")
    String getPaymentStatus(@PathVariable("paymentId") String paymentId);
}
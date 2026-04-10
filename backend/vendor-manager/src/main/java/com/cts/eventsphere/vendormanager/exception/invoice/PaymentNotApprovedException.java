package com.cts.eventsphere.vendormanager.exception.invoice;

public class PaymentNotApprovedException extends RuntimeException {
    public PaymentNotApprovedException(String paymentStatus) {
        super("Payment not approved. Current status: " + paymentStatus);
    }
}
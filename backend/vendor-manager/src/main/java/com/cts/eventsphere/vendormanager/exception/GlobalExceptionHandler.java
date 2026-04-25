package com.cts.eventsphere.vendormanager.exception;


import com.cts.eventsphere.vendormanager.dto.shared.GenericErrorResponse;
import com.cts.eventsphere.vendormanager.exception.contract.ContractNotFoundException;
import com.cts.eventsphere.vendormanager.exception.delivery.DeliveryNotFoundException;
import com.cts.eventsphere.vendormanager.exception.event.EventNotFoundException;
import com.cts.eventsphere.vendormanager.exception.invoice.InvoiceNotFoundException;
import com.cts.eventsphere.vendormanager.exception.invoice.InvoicePdfGenerationException;
import com.cts.eventsphere.vendormanager.exception.invoice.PaymentNotApprovedException;
import com.cts.eventsphere.vendormanager.exception.vendor.VendorAlreadyExistsException;
import com.cts.eventsphere.vendormanager.exception.vendor.VendorInUseException;
import com.cts.eventsphere.vendormanager.exception.vendor.VendorNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import org.slf4j.MDC;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(ContractNotFoundException.class)
    public ResponseEntity<GenericErrorResponse> handleContractNotFound(ContractNotFoundException e) {
        return new ResponseEntity<>(new GenericErrorResponse(e.getMessage()), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(InvoiceNotFoundException.class)
    public ResponseEntity<GenericErrorResponse> handleInvoiceNotFound(InvoiceNotFoundException e) {
        return new ResponseEntity<>(new GenericErrorResponse(e.getMessage()), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(VendorInUseException.class)
    public ResponseEntity<GenericErrorResponse> handleVendorInUse(VendorInUseException e) {
        log.warn("Deletion failed: Vendor is still referenced by active contracts. Message: {}", e.getMessage());

        GenericErrorResponse errorResponse = new GenericErrorResponse(
                e.getMessage()
        );

        // HttpStatus.CONFLICT (409) is the standard for Foreign Key/Constraint violations
        return new ResponseEntity<>(errorResponse, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(InvoicePdfGenerationException.class)
    public ResponseEntity<GenericErrorResponse> handleInvoicePdfError(InvoicePdfGenerationException e) {
        log.error("PDF System Failure: {}", e.getMessage());
        return new ResponseEntity<>(new GenericErrorResponse(e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
    }




    @ExceptionHandler(VendorNotFoundException.class)
    public ResponseEntity<GenericErrorResponse> handleVendorNotFound(VendorNotFoundException e) {
        return new ResponseEntity<>(new GenericErrorResponse(e.getMessage()), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(VendorAlreadyExistsException.class)
    public ResponseEntity<GenericErrorResponse> handleVendorAlreadyExists(VendorAlreadyExistsException e) {
        return new ResponseEntity<>(new GenericErrorResponse(e.getMessage()), HttpStatus.CONFLICT);
    }

    @ExceptionHandler(DeliveryNotFoundException.class)
    public ResponseEntity<GenericErrorResponse> handleDeliveryNotFound(DeliveryNotFoundException e) {
        return new ResponseEntity<>(new GenericErrorResponse(e.getMessage()), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(EventNotFoundException.class)
    public ResponseEntity<GenericErrorResponse> handleEventNotFound(EventNotFoundException e) {
        return new ResponseEntity<>(new GenericErrorResponse(e.getMessage()), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(PaymentNotApprovedException.class)
    public ResponseEntity<GenericErrorResponse> handlePaymentNotApproved(PaymentNotApprovedException e) {
        return new ResponseEntity<>(new GenericErrorResponse(e.getMessage()), HttpStatus.CONFLICT);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(e -> errors.put(e.getField(), e.getDefaultMessage()));
        return new ResponseEntity<>(errors, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<GenericErrorResponse> handleUnexpected(Exception ex) {
        String traceId = MDC.get("traceId");
        if (traceId == null) traceId = UUID.randomUUID().toString();
        log.error("Unhandled exception. traceId={}", traceId, ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new GenericErrorResponse("An unexpected error occurred. Contact support with traceId: " + traceId));
    }

}

package com.cts.eventsphere.vendormanager.exception;


import com.cts.eventsphere.vendormanager.dto.shared.GenericErrorResponse;
import com.cts.eventsphere.vendormanager.exception.contract.ContractNotFoundException;
import com.cts.eventsphere.vendormanager.exception.delivery.DeliveryNotFoundException;
import com.cts.eventsphere.vendormanager.exception.invoice.InvoiceNotFoundException;
import com.cts.eventsphere.vendormanager.exception.invoice.InvoicePdfGenerationException;
import com.cts.eventsphere.vendormanager.exception.vendor.VendorNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

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

    @ExceptionHandler(InvoicePdfGenerationException.class)
    public ResponseEntity<GenericErrorResponse> handleInvoicePdfError(InvoicePdfGenerationException e) {
        log.error("PDF System Failure: {}", e.getMessage());
        return new ResponseEntity<>(new GenericErrorResponse(e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(VendorNotFoundException.class)
    public ResponseEntity<GenericErrorResponse> handleVendorNotFound(VendorNotFoundException e) {
        return new ResponseEntity<>(new GenericErrorResponse(e.getMessage()), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(DeliveryNotFoundException.class)
    public ResponseEntity<GenericErrorResponse> handleDeliveryNotFound(DeliveryNotFoundException e) {
        return new ResponseEntity<>(new GenericErrorResponse(e.getMessage()), HttpStatus.NOT_FOUND);
    }

}

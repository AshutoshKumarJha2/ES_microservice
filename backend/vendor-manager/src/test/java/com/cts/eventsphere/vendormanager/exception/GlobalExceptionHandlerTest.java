package com.cts.eventsphere.vendormanager.exception;

import com.cts.eventsphere.vendormanager.dto.shared.GenericErrorResponse;
import com.cts.eventsphere.vendormanager.exception.contract.ContractNotFoundException;
import com.cts.eventsphere.vendormanager.exception.delivery.DeliveryNotFoundException;
import com.cts.eventsphere.vendormanager.exception.invoice.InvoiceNotFoundException;
import com.cts.eventsphere.vendormanager.exception.invoice.InvoicePdfGenerationException;
import com.cts.eventsphere.vendormanager.exception.vendor.VendorNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(MockitoExtension.class)
class GlobalExceptionHandlerTest {

    @InjectMocks
    private GlobalExceptionHandler handler;

    @Test
    void handleContractNotFound_returns404() {
        ContractNotFoundException ex = new ContractNotFoundException("Contract not found: c-1");

        ResponseEntity<GenericErrorResponse> response = handler.handleContractNotFound(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().error()).isEqualTo("Contract not found: c-1");
    }

    @Test
    void handleInvoiceNotFound_returns404() {
        InvoiceNotFoundException ex = new InvoiceNotFoundException("Invoice not found: inv-1");

        ResponseEntity<GenericErrorResponse> response = handler.handleInvoiceNotFound(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().error()).isEqualTo("Invoice not found: inv-1");
    }

    @Test
    void handleInvoicePdfError_returns500() {
        InvoicePdfGenerationException ex = new InvoicePdfGenerationException("PDF generation failed");

        ResponseEntity<GenericErrorResponse> response = handler.handleInvoicePdfError(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().error()).isEqualTo("PDF generation failed");
    }

    @Test
    void handleVendorNotFound_returns404() {
        VendorNotFoundException ex = new VendorNotFoundException("Vendor not found: v-1");

        ResponseEntity<GenericErrorResponse> response = handler.handleVendorNotFound(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().error()).isEqualTo("Vendor not found: v-1");
    }

    @Test
    void handleDeliveryNotFound_returns404() {
        DeliveryNotFoundException ex = new DeliveryNotFoundException("Delivery not found: d-1");

        ResponseEntity<GenericErrorResponse> response = handler.handleDeliveryNotFound(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().error()).isEqualTo("Delivery not found: d-1");
    }
}

package com.cts.eventsphere.vendormanager.controller;


import com.cts.eventsphere.vendormanager.auth.dto.UserPrincipal;
import com.cts.eventsphere.vendormanager.dto.invoice.InvoiceRequestDto;
import com.cts.eventsphere.vendormanager.dto.invoice.InvoiceResponseDto;
import com.cts.eventsphere.vendormanager.exception.invoice.InvoiceNotFoundException;
import com.cts.eventsphere.vendormanager.service.InvoiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for managing financial Invoices and PDF generation.
 * Provides endpoints for creating, retrieving, updating, and auditing billing records.
 * Adheres to mandatory coding standards for maintainability and professional documentation.
 *
 * @author 2480177
 * @version 1.0
 * @since 03-03-2026
 */

@RestController
@RequestMapping("/api/v1/invoices")
@RequiredArgsConstructor
@Slf4j
@Validated
public class InvoiceController {

    private final InvoiceService invoiceService;

    /**
     * Creates a new invoice record in the system.
     * Restricted to users with the 'FINANCE_OFFICER' role.
     *
     * @param user The currently authenticated user's details representing the actor.
     * @param request the invoice details including contract reference and amounts, validated by @Valid
     * @return ResponseEntity containing the created invoice response DTO with 201 Created status
     */
    @PostMapping
    @PreAuthorize("hasRole('FINANCE_OFFICER')")
    public ResponseEntity<InvoiceResponseDto> create(@AuthenticationPrincipal UserPrincipal user, @Valid @RequestBody InvoiceRequestDto request) {
        var actorId = user.userId();
        log.info("REST request to create invoice for contract: {} by actorId={}", request.contractId(), actorId);
        return new ResponseEntity<>(invoiceService.createInvoice(user.userId(), request), HttpStatus.CREATED);
    }

    /**
     * Retrieves the details of a specific invoice by its unique identifier.
     * Accessible by Finance Officers, Vendors, and Administrators.
     *
     * @param user The currently authenticated user's details representing the actor.
     * @param id the unique UUID string of the invoice
     * @return ResponseEntity containing the invoice details with 200 OK status
     * @throws InvoiceNotFoundException if the specified invoice ID does not exist in the database
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('FINANCE_OFFICER','VENDOR','ADMIN')")
    public ResponseEntity<InvoiceResponseDto> getById(@AuthenticationPrincipal UserPrincipal user, @PathVariable String id) {
        var actorId = user.userId();
        log.info("REST request to fetch invoice ID: {} by actorId={}", id, actorId);
        return ResponseEntity.ok(invoiceService.getInvoiceById(user.userId(),id));
    }

    /**
     * Generates and downloads a professional PDF document for a specific invoice.
     * Sets appropriate HTTP headers for browser file download as an attachment.
     *
     * @param user The currently authenticated user's details representing the actor.
     * @param invoiceId the unique UUID of the invoice to be converted to PDF
     * @return ResponseEntity containing the PDF byte array with APPLICATION_PDF media type
     * @throws InvoiceNotFoundException if the invoice record is not found for the given ID
     */
    @GetMapping("/{invoiceId}/download")
    public ResponseEntity<byte[]> downloadPdf(@AuthenticationPrincipal UserPrincipal user, @PathVariable String invoiceId) {
        var actorId = user.userId();
        log.info("REST request to download invoice as PDF for invoice ID: {} by actorId={}", invoiceId, actorId);
        byte[] pdf = invoiceService.generateInvoicePdf(user.userId(),invoiceId);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "invoice_" + invoiceId + ".pdf");
        return new ResponseEntity<>(pdf, headers, HttpStatus.OK);
    }

    /**
     * Fetches a complete list of all invoices registered in the system.
     * Useful for financial reporting and auditing.
     *
     * @param user The currently authenticated user's details representing the actor.
     * @return ResponseEntity containing a list of all invoice response DTOs
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('FINANCE_OFFICER','VENDOR','ADMIN')")
    public ResponseEntity<List<InvoiceResponseDto>> getAll(@AuthenticationPrincipal UserPrincipal user) {
        var actorId = user.userId();
        log.info("REST request to fetch all invoices by actorId={}", actorId);
        return ResponseEntity.ok(invoiceService.getAllInvoices(user.userId()));
    }

    /**
     * Updates an existing invoice record with new billing or status information.
     * Restricted to users with the 'FINANCE_OFFICER' role.
     *
     * @param user The currently authenticated user's details representing the actor.
     * @param id the unique UUID of the invoice to update
     * @param request the updated invoice details wrapped in a DTO
     * @return ResponseEntity containing the updated invoice response DTO
     * @throws InvoiceNotFoundException if the specified invoice ID is invalid or missing
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('FINANCE_OFFICER')")
    public ResponseEntity<InvoiceResponseDto> update(
            @AuthenticationPrincipal UserPrincipal user,
            @PathVariable String id,
            @Valid @RequestBody InvoiceRequestDto request) {

        var actorId = user.userId();
        log.info("REST request to update invoice ID: {} by actorId={}", id, actorId);
        return ResponseEntity.ok(invoiceService.updateInvoice(user.userId(),id, request));
    }

    /**
     * Permanently removes an invoice record from the system.
     * This operation is strictly restricted to users with the 'ADMIN' role.
     *
     * @param user The currently authenticated user's details representing the actor.
     * @param id the unique UUID of the invoice to remove
     * @return ResponseEntity with 204 No Content status on successful deletion
     * @throws InvoiceNotFoundException if the invoice ID does not exist in the system
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal UserPrincipal user,@PathVariable String id) {
        var actorId = user.userId();
        log.info("REST request to delete invoice ID: {} by actorId={}", id, actorId);
        invoiceService.deleteInvoice(user.userId(),id);
        return ResponseEntity.noContent().build();
    }
}

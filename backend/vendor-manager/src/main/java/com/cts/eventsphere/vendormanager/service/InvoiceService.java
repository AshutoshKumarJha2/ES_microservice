package com.cts.eventsphere.vendormanager.service;

import com.cts.eventsphere.vendormanager.dto.invoice.InvoiceRequestDto;
import com.cts.eventsphere.vendormanager.dto.invoice.InvoiceResponseDto;

import java.util.List;

/**
 * Service interface for Invoice Operations.
 * Defines the contract for managing financial billing records and PDF generation.
 *
 * @author 2480177
 * @version 1.0
 * @since 03-03-2026
 */

public interface InvoiceService {
    /**
     * Creates a new invoice record in the system.
     * @param request the invoice details to be persisted
     * @return the created invoice response DTO
     */
    InvoiceResponseDto createInvoice(String actorId, InvoiceRequestDto request);

    /**
     * Retrieves an invoice by its unique identifier.
     * @param invoiceId the unique ID of the invoice
     * @return the invoice details response DTO
     */
    InvoiceResponseDto getInvoiceById(String actorId, String invoiceId);

    /**
     * Retrieves all invoices currently stored in the system.
     * @return list of all invoice response DTOs
     */
    List<InvoiceResponseDto> getAllInvoices(String actorId);

    /**
     * Updates an existing invoice's details.
     * @param invoiceId the ID of the invoice to update
     * @param request the new billing details
     * @return the updated invoice response DTO
     */
    InvoiceResponseDto updateInvoice(String actorId, String invoiceId, InvoiceRequestDto request);

    /**
     * Orchestrates invoice generation after verifying payment status via Payment Service.
     *
     * @param actorId the user performing the action
     * @param transactionId the external transaction ID from the payment service
     * @param request the invoice details
     * @return the generated invoice response DTO
     * @throws IllegalStateException if payment is not approved
     */
    InvoiceResponseDto processInvoiceAfterPayment(String actorId, String transactionId, InvoiceRequestDto request);

    /**
     * Removes an invoice from the system.
     * @param invoiceId the unique ID to delete
     */
    void deleteInvoice(String actorId, String invoiceId);

    /**
     * Business logic for generating an invoice specifically linked to a contract.
     * * @param contractId the unique identifier of the contract
     * @param dto the invoice data
     * @return the generated invoice response DTO
     */
    InvoiceResponseDto generateInvoice(String actorId, String contractId, InvoiceRequestDto dto);

    /**
     * Generates a PDF document for a specific invoice.
     * * @param invoiceId the unique identifier of the invoice
     * @return a byte array containing the PDF document data
     */
    byte[] generateInvoicePdf(String actorId, String invoiceId);
}

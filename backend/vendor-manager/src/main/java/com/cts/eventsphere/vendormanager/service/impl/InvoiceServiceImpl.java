    package com.cts.eventsphere.vendormanager.service.impl;

    import com.cts.eventsphere.vendormanager.client.EventClient;
    import com.cts.eventsphere.vendormanager.client.PaymentClient;
    import com.cts.eventsphere.vendormanager.dto.invoice.InvoiceRequestDto;
    import com.cts.eventsphere.vendormanager.dto.invoice.InvoiceResponseDto;
    import com.cts.eventsphere.vendormanager.dto.mapper.invoice.InvoiceRequestDtoMapper;
    import com.cts.eventsphere.vendormanager.dto.mapper.invoice.InvoiceResponseDtoMapper;
    import com.cts.eventsphere.vendormanager.exception.invoice.InvoiceNotFoundException;
    import com.cts.eventsphere.vendormanager.exception.invoice.InvoicePdfGenerationException;
    import com.cts.eventsphere.vendormanager.model.Invoice;
    import com.cts.eventsphere.vendormanager.model.data.InvoiceStatus;
    import com.cts.eventsphere.vendormanager.repository.InvoiceRepository;
    import com.cts.eventsphere.vendormanager.service.InvoiceService;
    import com.lowagie.text.Document;
    import com.lowagie.text.FontFactory;
    import com.lowagie.text.PageSize;
    import com.lowagie.text.Paragraph;
    import com.lowagie.text.pdf.PdfWriter;
    import lombok.RequiredArgsConstructor;
    import lombok.extern.slf4j.Slf4j;
    import org.springframework.stereotype.Service;
    import org.springframework.transaction.annotation.Transactional;

    import java.io.ByteArrayOutputStream;
    import java.time.LocalDateTime;
    import java.util.List;

    /**
     * Service Implementation for Invoice operations.
     * Manages financial billing records and professional PDF document generation.
     *
     * @author 2480177
     * @version 1.0
     * @since 03-03-2026
     */

    @Service
    @RequiredArgsConstructor
    @Slf4j
    public class InvoiceServiceImpl implements InvoiceService {

        private final InvoiceRepository invoiceRepository;
        private final InvoiceRequestDtoMapper requestDtoMapper;
        private final InvoiceResponseDtoMapper responseDtoMapper;

        private final PaymentClient paymentClient;
    //    private final AuditService auditService;
    //    private final NotificationService notificationService;

        /**
         * Creates a new invoice and persists it to the database.
         *
         * @param request the invoice details provided via DTO
         * @return the created invoice details as a response DTO
         */
        @Override
        @Transactional
        public InvoiceResponseDto createInvoice(String actorId, InvoiceRequestDto request){
            log.info("Attempting to create invoice for contract ID: {} by actorId={}", request.contractId(), actorId);
            Invoice saved = invoiceRepository.save(requestDtoMapper.toEntity(request));

            log.info("Successfully created invoice with ID: {} by actorId={}", saved.getInvoiceId(), actorId);
    //        auditService.logAudit(actorId, AuditAction.CREATE, Invoice.class, saved.getInvoiceId());
    //        notificationService.sendNotification(
    //                actorId,
    //                "Invoice created. Amount: " + saved.getTotalAmount(),
    //                "INVOICE_CREATED"
    //        );
            return responseDtoMapper.toDto(saved);
        }

        /**
         * Retrieves an invoice by its unique ID.
         *
         * @param invoiceId the unique identifier
         * @return the invoice response DTO
         * @throws InvoiceNotFoundException if ID not found
         */
        @Override
        @Transactional(readOnly = true)
        public InvoiceResponseDto getInvoiceById(String actorId, String invoiceId){
            log.info("Fetching invoice details for ID: {} by actorId={}", invoiceId, actorId);

            Invoice invoice = invoiceRepository.findById(invoiceId)
                    .orElseThrow(() -> new InvoiceNotFoundException(invoiceId));

    //        auditService.logAudit(actorId, AuditAction.READ, Invoice.class, invoiceId);
            return responseDtoMapper.toDto(invoice);
        }

        /**
         * Fetches all invoices currently registered in the system.
         *
         * @return a list of invoice response DTOs
         */
        @Override
        @Transactional(readOnly = true)
        public List<InvoiceResponseDto> getAllInvoices(String actorId){
            log.info("Fetching all invoices from database by actorId={}", actorId);
            return invoiceRepository.findAll().stream()
    //                .peek(i ->
    //                        auditService.logAudit(
    //                                actorId,
    //                                AuditAction.READ,
    //                                Invoice.class,
    //                                i.getInvoiceId()
    //                        )
    //                )
                    .map(responseDtoMapper::toDto)
                    .toList();
        }

        /**
         * Generates an invoice specifically linked to a contract ID.
         *
         * @param contractId the linked contract identifier
         * @param dto the invoice details
         * @return the saved invoice response DTO
         */
        @Override
        @Transactional
        public InvoiceResponseDto generateInvoice(String actorId, String contractId, InvoiceRequestDto dto) {
            log.info("Generating invoice for contractId={} by actorId={}", contractId, actorId);
            Invoice invoice = requestDtoMapper.toEntity(dto);
            invoice.setContractId(contractId);
            Invoice saved = invoiceRepository.save(invoice);
    //        auditService.logAudit(actorId, AuditAction.CREATE, Invoice.class, saved.getInvoiceId());
    //        notificationService.sendNotification(
    //                actorId,
    //                "Invoice generated. Invoice ID: " + saved.getInvoiceId(),
    //                "INVOICE_GENERATED"
    //        );
            return responseDtoMapper.toDto(saved);
        }

        @Override
        @Transactional
        public InvoiceResponseDto processInvoiceAfterPayment(String actorId, String transactionId, InvoiceRequestDto dto) {
            log.info("Verifying payment status for transaction: {}", transactionId);

            String paymentStatus = paymentClient.getPaymentStatus(transactionId);

            if (!"APPROVED".equalsIgnoreCase(paymentStatus)) {
                throw new IllegalStateException("Payment not approved. Current status: " + paymentStatus);
            }

            Invoice invoice = requestDtoMapper.toEntity(dto);
            invoice.setContractId(dto.contractId());
            invoice.setTransactionId(transactionId);
            invoice.setStatus(InvoiceStatus.PAID);

            Invoice saved = invoiceRepository.save(invoice);
            log.info("Invoice {} generated successfully after payment.", saved.getInvoiceId());

            return responseDtoMapper.toDto(saved);
        }

        /**
         * Generates a PDF byte array for a specific invoice.
         *
         * @param invoiceId the ID of the invoice to print
         * @return byte array containing PDF data
         * @throws InvoiceNotFoundException if invoice does not exist
         * @throws InvoicePdfGenerationException if PDF creation fails
         */
        @Override
        @Transactional(readOnly = true)
        public byte[] generateInvoicePdf(String actorId, String invoiceId) {
            log.info("Generating invoice PDF for invoiceId={} by actorId={}", invoiceId, actorId);
            Invoice invoice = invoiceRepository.findById(invoiceId)
                    .orElseThrow(() -> new InvoiceNotFoundException(invoiceId));

    //        auditService.logAudit(actorId, AuditAction.READ, Invoice.class, invoiceId);
    //
    //        notificationService.sendNotification(
    //                actorId,
    //                "Invoice PDF downloaded. Invoice ID: " + invoiceId,
    //                "INVOICE_PDF_DOWNLOADED"
    //        );

            try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
                Document document = new Document(PageSize.A4);
                PdfWriter.getInstance(document, out);
                document.open();

                document.add(new Paragraph("EVENTSPHERE INVOICE", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18)));
                document.add(new Paragraph("Invoice ID: " + invoice.getInvoiceId()));
                document.add(new Paragraph("Contract Reference: " + invoice.getContractId()));
                document.add(new Paragraph("Amount Due: $" + invoice.getTotalAmount()));
                document.add(new Paragraph("Generated on: " + LocalDateTime.now()));

                document.close();
                return out.toByteArray();
            } catch (Exception e) {
                throw new InvoicePdfGenerationException("PDF Error: " + e.getMessage());
            }
        }

        /**
         * Updates the comprehensive details of an existing invoice record.
         *
         * @param invoiceId the ID to update
         * @param request the updated invoice details
         * @return the updated invoice response
         */
        @Override
        @Transactional
        public InvoiceResponseDto updateInvoice(String actorId, String invoiceId, InvoiceRequestDto request){
            log.info("Attempting to update invoice ID: {} by actorId={}", invoiceId, actorId);

            Invoice invoice = invoiceRepository.findById(invoiceId)
                    .orElseThrow(() -> new InvoiceNotFoundException(invoiceId));

            invoice.setTotalAmount(request.totalAmount());
            invoice.setDueDate(request.dueDate());
            invoice.setStatus(request.status());

            log.info("Successfully updated invoice details for ID: {} by actorId={}", invoiceId, actorId);
    //        auditService.logAudit(actorId, AuditAction.UPDATE, Invoice.class, invoiceId);
    //        notificationService.sendNotification(
    //                actorId,
    //                "Invoice updated. Invoice ID: " + invoiceId,
    //                "INVOICE_UPDATED"
    //        );
            return responseDtoMapper.toDto(invoiceRepository.save(invoice));
        }

        /**
         * Removes an invoice record from the system.
         *
         * @param invoiceId the unique identifier to delete
         * @throws InvoiceNotFoundException if the invoice ID does not exist in the database
         */
        @Override
        @Transactional
        public void deleteInvoice(String actorId, String invoiceId){
            log.info("Attempting to delete invoice ID: {} by actorId={}", invoiceId, actorId);

            if(!invoiceRepository.existsById(invoiceId)){
                throw new InvoiceNotFoundException(invoiceId);
            }

            invoiceRepository.deleteById(invoiceId);
            log.info("Successfully deleted invoice ID: {} by actorId={}", invoiceId, actorId);
    //        auditService.logAudit(actorId, AuditAction.DELETE, Invoice.class, invoiceId);
    //        notificationService.sendNotification(
    //                actorId,
    //                "Invoice deleted. Invoice ID: " + invoiceId,
    //                "INVOICE_DELETED"
    //        );
        }
    }

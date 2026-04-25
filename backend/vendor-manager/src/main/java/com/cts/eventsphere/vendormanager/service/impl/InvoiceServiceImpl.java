package com.cts.eventsphere.vendormanager.service.impl;

import com.cts.eventsphere.vendormanager.client.PaymentClient;
import com.cts.eventsphere.vendormanager.dto.invoice.InvoiceRequestDto;
import com.cts.eventsphere.vendormanager.dto.invoice.InvoiceResponseDto;
import com.cts.eventsphere.vendormanager.dto.mapper.invoice.InvoiceRequestDtoMapper;
import com.cts.eventsphere.vendormanager.dto.mapper.invoice.InvoiceResponseDtoMapper;
import com.cts.eventsphere.vendormanager.exception.invoice.InvoiceNotFoundException;
import com.cts.eventsphere.vendormanager.exception.invoice.InvoicePdfGenerationException;
import com.cts.eventsphere.vendormanager.exception.invoice.PaymentNotApprovedException;
import com.cts.eventsphere.vendormanager.model.Contract;
import com.cts.eventsphere.vendormanager.model.Delivery;
import com.cts.eventsphere.vendormanager.model.Invoice;
import com.cts.eventsphere.vendormanager.model.Vendor;
import com.cts.eventsphere.vendormanager.model.data.InvoiceStatus;
import com.cts.eventsphere.vendormanager.repository.ContractRepository;
import com.cts.eventsphere.vendormanager.repository.InvoiceRepository;
import com.cts.eventsphere.vendormanager.repository.VendorRepository;
import com.cts.eventsphere.vendormanager.service.InvoiceService;
import com.lowagie.text.Chunk;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class InvoiceServiceImpl implements InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final ContractRepository contractRepository;
    private final VendorRepository vendorRepository;
    private final InvoiceRequestDtoMapper requestDtoMapper;
    private final InvoiceResponseDtoMapper responseDtoMapper;
    private final PaymentClient paymentClient;

    @Override
    @Transactional
    public InvoiceResponseDto createInvoice(String actorId, InvoiceRequestDto request) {
        log.info("Attempting to create invoice for contract ID: {} by actorId={}", request.contractId(), actorId);
        Invoice saved = invoiceRepository.save(requestDtoMapper.toEntity(request));
        log.info("Successfully created invoice with ID: {} by actorId={}", saved.getInvoiceId(), actorId);
        return responseDtoMapper.toDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public InvoiceResponseDto getInvoiceById(String actorId, String invoiceId) {
        log.info("Fetching invoice details for ID: {} by actorId={}", invoiceId, actorId);
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new InvoiceNotFoundException(invoiceId));
        return responseDtoMapper.toDto(invoice);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InvoiceResponseDto> getAllInvoices(String actorId) {
        log.info("Fetching all invoices from database by actorId={}", actorId);
        return invoiceRepository.findAll().stream()
                .map(responseDtoMapper::toDto)
                .toList();
    }

    @Override
    @Transactional
    public InvoiceResponseDto generateInvoice(String actorId, String contractId, InvoiceRequestDto dto) {
        log.info("Generating invoice for contractId={} by actorId={}", contractId, actorId);
        Invoice invoice = requestDtoMapper.toEntity(dto);
        invoice.setContractId(contractId);
        Invoice saved = invoiceRepository.save(invoice);
        return responseDtoMapper.toDto(saved);
    }

    @Override
    @Transactional
    public InvoiceResponseDto processInvoiceAfterPayment(String actorId, String transactionId, InvoiceRequestDto dto) {
        log.info("Verifying payment status for transaction: {}", transactionId);
        String paymentStatus = paymentClient.getPaymentStatus(transactionId);
        if (!"COMPLETED".equalsIgnoreCase(paymentStatus)) {
            throw new PaymentNotApprovedException(paymentStatus);
        }
        Invoice invoice = requestDtoMapper.toEntity(dto);
        invoice.setContractId(dto.contractId());
        invoice.setTransactionId(transactionId);
        invoice.setStatus(InvoiceStatus.PAID);
        Invoice saved = invoiceRepository.save(invoice);
        log.info("Invoice {} generated successfully after payment.", saved.getInvoiceId());
        return responseDtoMapper.toDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] generateInvoicePdf(String actorId, String invoiceId) {
        log.info("Generating invoice PDF for invoiceId={} by actorId={}", invoiceId, actorId);

        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new InvoiceNotFoundException(invoiceId));

        Contract contract = contractRepository.findById(invoice.getContractId()).orElse(null);
        Vendor vendor = (contract != null)
                ? vendorRepository.findById(contract.getVendorId()).orElse(null)
                : null;

        String vendorName    = vendor != null ? vendor.getName()        : "—";
        String vendorContact = vendor != null ? vendor.getContactInfo() : "—";
        String contractPeriod = contract != null
                ? formatDate(contract.getStartDate()) + " – " + formatDate(contract.getEndDate())
                : "—";
        String contractValue  = contract != null
                ? String.format("$%,.2f", contract.getValue())
                : "—";
        String contractStatus = contract != null ? contract.getStatus().name() : "—";

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 50, 50, 60, 60);
            PdfWriter.getInstance(document, out);
            document.open();

            Font brandFont  = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22);
            Font headFont   = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11);
            Font labelFont  = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9);
            Font valueFont  = FontFactory.getFont(FontFactory.HELVETICA, 10);
            Font amountFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
            Font footerFont = FontFactory.getFont(FontFactory.HELVETICA, 8);

            // ── Header: brand left, "INVOICE" right ───────────────────────────
            PdfPTable headerTable = new PdfPTable(2);
            headerTable.setWidthPercentage(100);
            headerTable.setSpacingAfter(16);

            PdfPCell brandCell = noBorderCell(new Phrase("EventSphere", brandFont));
            brandCell.setHorizontalAlignment(Element.ALIGN_LEFT);

            Font invoiceWordFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 26);
            PdfPCell wordCell = noBorderCell(new Phrase("INVOICE", invoiceWordFont));
            wordCell.setHorizontalAlignment(Element.ALIGN_RIGHT);

            headerTable.addCell(brandCell);
            headerTable.addCell(wordCell);
            document.add(headerTable);

            addSeparator(document);

            // ── Invoice meta ──────────────────────────────────────────────────
            document.add(spacer(8));
            addRow(document, "Invoice No",  "INV-" + invoiceId.substring(0, 8).toUpperCase(), labelFont, valueFont);
            addRow(document, "Issue Date",  formatDate(invoice.getIssueDate()),               labelFont, valueFont);
            addRow(document, "Due Date",    formatDate(invoice.getDueDate()),                 labelFont, valueFont);
            addRow(document, "Status",      invoice.getStatus().name(),                       labelFont, valueFont);
            if (invoice.getTransactionId() != null && !invoice.getTransactionId().isBlank()) {
                addRow(document, "Transaction", invoice.getTransactionId(), labelFont, valueFont);
            }

            document.add(spacer(12));
            addSeparator(document);

            // ── Vendor details ────────────────────────────────────────────────
            document.add(spacer(8));
            Paragraph vendorHead = new Paragraph("VENDOR DETAILS", headFont);
            vendorHead.setSpacingAfter(6);
            document.add(vendorHead);
            addRow(document, "Name",    vendorName,    labelFont, valueFont);
            addRow(document, "Contact", vendorContact, labelFont, valueFont);

            document.add(spacer(14));

            // ── Contract details ──────────────────────────────────────────────
            Paragraph contractHead = new Paragraph("CONTRACT DETAILS", headFont);
            contractHead.setSpacingAfter(6);
            document.add(contractHead);
            addRow(document, "Period",    contractPeriod, labelFont, valueFont);
            addRow(document, "Value",     contractValue,  labelFont, valueFont);
            addRow(document, "Status",    contractStatus, labelFont, valueFont);

            // ── Delivery details ──────────────────────────────────────────────
            document.add(spacer(14));
            Paragraph deliveryHead = new Paragraph("DELIVERY DETAILS", headFont);
            deliveryHead.setSpacingAfter(6);
            document.add(deliveryHead);

            List<Delivery> deliveries = invoice.getDeliveries();
            if (deliveries == null || deliveries.isEmpty()) {
                Paragraph noDelivery = new Paragraph("No deliveries logged for this invoice.", valueFont);
                noDelivery.setSpacingAfter(8);
                document.add(noDelivery);
            } else {
                PdfPTable deliveryTable = new PdfPTable(5);
                deliveryTable.setWidthPercentage(100);
                deliveryTable.setSpacingAfter(8);
                deliveryTable.setWidths(new float[]{30f, 12f, 18f, 22f, 18f});

                // Table header row
                for (String col : new String[]{"Item", "Qty", "Status", "Tracking #", "Delivery Date"}) {
                    PdfPCell hCell = new PdfPCell(new Phrase(col, labelFont));
                    hCell.setPadding(5);
                    hCell.setBorderWidthBottom(1f);
                    hCell.setBorderWidthTop(0);
                    hCell.setBorderWidthLeft(0);
                    hCell.setBorderWidthRight(0);
                    deliveryTable.addCell(hCell);
                }

                // Data rows
                for (Delivery d : deliveries) {
                    deliveryTable.addCell(dataCell(d.getItem(), valueFont));
                    deliveryTable.addCell(dataCell(String.valueOf(d.getQuantity()), valueFont));
                    deliveryTable.addCell(dataCell(d.getStatus().name(), valueFont));
                    deliveryTable.addCell(dataCell(d.getTrackingNumber() != null ? d.getTrackingNumber() : "—", valueFont));
                    deliveryTable.addCell(dataCell(formatDate(d.getDeliveryDate()), valueFont));
                }
                document.add(deliveryTable);
            }

            document.add(spacer(16));
            addSeparator(document);
            document.add(spacer(8));

            // ── Amount due ────────────────────────────────────────────────────
            Paragraph amountHead = new Paragraph("AMOUNT DUE", headFont);
            amountHead.setSpacingAfter(4);
            document.add(amountHead);
            Paragraph amountValue = new Paragraph(String.format("$%,.2f", invoice.getTotalAmount()), amountFont);
            amountValue.setSpacingAfter(20);
            document.add(amountValue);

            addSeparator(document);
            document.add(spacer(8));

            // ── Footer ────────────────────────────────────────────────────────
            Paragraph footer = new Paragraph(
                "This is a computer-generated invoice. No signature required.  |  Generated: "
                    + formatDateTime(LocalDateTime.now()),
                footerFont
            );
            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);

            document.close();
            return out.toByteArray();

        } catch (Exception e) {
            throw new InvoicePdfGenerationException("PDF Error: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public InvoiceResponseDto updateInvoice(String actorId, String invoiceId, InvoiceRequestDto request) {
        log.info("Attempting to update invoice ID: {} by actorId={}", invoiceId, actorId);
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new InvoiceNotFoundException(invoiceId));
        invoice.setTotalAmount(request.totalAmount());
        invoice.setDueDate(request.dueDate());
        invoice.setStatus(request.status());
        log.info("Successfully updated invoice details for ID: {} by actorId={}", invoiceId, actorId);
        return responseDtoMapper.toDto(invoiceRepository.save(invoice));
    }

    @Override
    @Transactional
    public void deleteInvoice(String actorId, String invoiceId) {
        log.info("Attempting to delete invoice ID: {} by actorId={}", invoiceId, actorId);
        if (!invoiceRepository.existsById(invoiceId)) {
            throw new InvoiceNotFoundException(invoiceId);
        }
        invoiceRepository.deleteById(invoiceId);
        log.info("Successfully deleted invoice ID: {} by actorId={}", invoiceId, actorId);
    }

    // ── PDF helpers ──────────────────────────────────────────────────────────────

    private void addRow(Document doc, String label, String value, Font labelFont, Font valueFont)
            throws DocumentException {
        Paragraph p = new Paragraph();
        p.add(new Chunk(label + ":   ", labelFont));
        p.add(new Chunk(value, valueFont));
        p.setSpacingAfter(4);
        doc.add(p);
    }

    private void addSeparator(Document doc) throws DocumentException {
        Paragraph sep = new Paragraph(
            "─────────────────────────────────────────────────────────────────────────────────"
        );
        sep.setSpacingAfter(4);
        doc.add(sep);
    }

    private Paragraph spacer(int points) {
        Paragraph p = new Paragraph(" ");
        p.setSpacingAfter(points);
        return p;
    }

    private PdfPCell noBorderCell(Phrase phrase) {
        PdfPCell cell = new PdfPCell(phrase);
        cell.setBorder(PdfPCell.NO_BORDER);
        cell.setPaddingBottom(4);
        return cell;
    }

    private PdfPCell dataCell(String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setPadding(5);
        cell.setBorder(PdfPCell.NO_BORDER);
        return cell;
    }

    private String formatDate(LocalDateTime dt) {
        if (dt == null) return "—";
        return dt.format(DateTimeFormatter.ofPattern("dd MMM yyyy"));
    }

    private String formatDateTime(LocalDateTime dt) {
        if (dt == null) return "—";
        return dt.format(DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm"));
    }
}

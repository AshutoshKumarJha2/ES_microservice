package com.cts.eventsphere.vendormanager.service;

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
import com.cts.eventsphere.vendormanager.service.impl.InvoiceServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InvoiceServiceImplTest {

    @Mock private InvoiceRepository invoiceRepository;
    @Mock private InvoiceRequestDtoMapper requestDtoMapper;
    @Mock private InvoiceResponseDtoMapper responseDtoMapper;
    @Mock private PaymentClient paymentClient;

    @InjectMocks
    private InvoiceServiceImpl invoiceService;

    private static final String ACTOR_ID = "actor-1";
    private static final String INVOICE_ID = "invoice-100";
    private static final String CONTRACT_ID = "contract-200";

    private Invoice buildInvoice(String id, InvoiceStatus status) {
        Invoice invoice = new Invoice();
        invoice.setInvoiceId(id);
        invoice.setContractId(CONTRACT_ID);
        invoice.setTotalAmount(BigDecimal.valueOf(5000));
        invoice.setDueDate(LocalDateTime.now().plusDays(30));
        invoice.setStatus(status);
        invoice.setCreatedAt(LocalDateTime.now());
        invoice.setUpdatedAt(LocalDateTime.now());
        return invoice;
    }

    private InvoiceResponseDto buildResponseDto(String id, InvoiceStatus status) {
        return new InvoiceResponseDto(id, CONTRACT_ID, null,
                LocalDateTime.now(), BigDecimal.valueOf(5000), LocalDateTime.now().plusDays(30),
                status, LocalDateTime.now(), LocalDateTime.now());
    }

    private InvoiceRequestDto buildRequestDto() {
        return new InvoiceRequestDto(CONTRACT_ID, BigDecimal.valueOf(5000),
                LocalDateTime.now().plusDays(30), InvoiceStatus.ISSUED, null);
    }

    // ─── createInvoice ────────────────────────────────────────────────────────

    @Test
    void createInvoice_success() {
        InvoiceRequestDto request = buildRequestDto();
        Invoice invoice = buildInvoice(null, InvoiceStatus.ISSUED);
        Invoice saved = buildInvoice(INVOICE_ID, InvoiceStatus.ISSUED);
        InvoiceResponseDto expected = buildResponseDto(INVOICE_ID, InvoiceStatus.ISSUED);

        when(requestDtoMapper.toEntity(request)).thenReturn(invoice);
        when(invoiceRepository.save(invoice)).thenReturn(saved);
        when(responseDtoMapper.toDto(saved)).thenReturn(expected);

        InvoiceResponseDto result = invoiceService.createInvoice(ACTOR_ID, request);

        assertThat(result.invoiceId()).isEqualTo(INVOICE_ID);
        assertThat(result.status()).isEqualTo(InvoiceStatus.ISSUED);
    }

    // ─── getInvoiceById ───────────────────────────────────────────────────────

    @Test
    void getInvoiceById_found() {
        Invoice invoice = buildInvoice(INVOICE_ID, InvoiceStatus.ISSUED);
        InvoiceResponseDto expected = buildResponseDto(INVOICE_ID, InvoiceStatus.ISSUED);

        when(invoiceRepository.findById(INVOICE_ID)).thenReturn(Optional.of(invoice));
        when(responseDtoMapper.toDto(invoice)).thenReturn(expected);

        InvoiceResponseDto result = invoiceService.getInvoiceById(ACTOR_ID, INVOICE_ID);

        assertThat(result.invoiceId()).isEqualTo(INVOICE_ID);
    }

    @Test
    void getInvoiceById_notFound_throwsInvoiceNotFoundException() {
        when(invoiceRepository.findById(INVOICE_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> invoiceService.getInvoiceById(ACTOR_ID, INVOICE_ID))
                .isInstanceOf(InvoiceNotFoundException.class);
    }

    // ─── getAllInvoices ───────────────────────────────────────────────────────

    @Test
    void getAllInvoices_returnsList() {
        Invoice i1 = buildInvoice("i1", InvoiceStatus.ISSUED);
        Invoice i2 = buildInvoice("i2", InvoiceStatus.PAID);
        InvoiceResponseDto dto1 = buildResponseDto("i1", InvoiceStatus.ISSUED);
        InvoiceResponseDto dto2 = buildResponseDto("i2", InvoiceStatus.PAID);

        when(invoiceRepository.findAll()).thenReturn(List.of(i1, i2));
        when(responseDtoMapper.toDto(i1)).thenReturn(dto1);
        when(responseDtoMapper.toDto(i2)).thenReturn(dto2);

        List<InvoiceResponseDto> result = invoiceService.getAllInvoices(ACTOR_ID);

        assertThat(result).hasSize(2);
    }

    @Test
    void getAllInvoices_empty_returnsEmptyList() {
        when(invoiceRepository.findAll()).thenReturn(List.of());

        assertThat(invoiceService.getAllInvoices(ACTOR_ID)).isEmpty();
    }

    // ─── generateInvoice ─────────────────────────────────────────────────────

    @Test
    void generateInvoice_success() {
        InvoiceRequestDto dto = buildRequestDto();
        Invoice invoice = buildInvoice(null, InvoiceStatus.ISSUED);
        Invoice saved = buildInvoice(INVOICE_ID, InvoiceStatus.ISSUED);
        InvoiceResponseDto expected = buildResponseDto(INVOICE_ID, InvoiceStatus.ISSUED);

        when(requestDtoMapper.toEntity(dto)).thenReturn(invoice);
        when(invoiceRepository.save(invoice)).thenReturn(saved);
        when(responseDtoMapper.toDto(saved)).thenReturn(expected);

        InvoiceResponseDto result = invoiceService.generateInvoice(ACTOR_ID, CONTRACT_ID, dto);

        assertThat(result.invoiceId()).isEqualTo(INVOICE_ID);
        assertThat(invoice.getContractId()).isEqualTo(CONTRACT_ID);
    }

    // ─── processInvoiceAfterPayment ───────────────────────────────────────────

    @Test
    void processInvoiceAfterPayment_completed_createsInvoice() {
        InvoiceRequestDto dto = buildRequestDto();
        Invoice invoice = buildInvoice(null, InvoiceStatus.ISSUED);
        Invoice saved = buildInvoice(INVOICE_ID, InvoiceStatus.PAID);
        InvoiceResponseDto expected = buildResponseDto(INVOICE_ID, InvoiceStatus.PAID);
        String txId = "tx-999";

        when(paymentClient.getPaymentStatus(txId)).thenReturn("COMPLETED");
        when(requestDtoMapper.toEntity(dto)).thenReturn(invoice);
        when(invoiceRepository.save(invoice)).thenReturn(saved);
        when(responseDtoMapper.toDto(saved)).thenReturn(expected);

        InvoiceResponseDto result = invoiceService.processInvoiceAfterPayment(ACTOR_ID, txId, dto);

        assertThat(result.status()).isEqualTo(InvoiceStatus.PAID);
    }

    @Test
    void processInvoiceAfterPayment_notCompleted_throwsIllegalStateException() {
        InvoiceRequestDto dto = buildRequestDto();
        String txId = "tx-888";

        when(paymentClient.getPaymentStatus(txId)).thenReturn("PENDING");

        assertThatThrownBy(() -> invoiceService.processInvoiceAfterPayment(ACTOR_ID, txId, dto))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("PENDING");
    }

    // ─── generateInvoicePdf ──────────────────────────────────────────────────

    @Test
    void generateInvoicePdf_success_returnsByteArray() {
        Invoice invoice = buildInvoice(INVOICE_ID, InvoiceStatus.ISSUED);

        when(invoiceRepository.findById(INVOICE_ID)).thenReturn(Optional.of(invoice));

        byte[] pdf = invoiceService.generateInvoicePdf(ACTOR_ID, INVOICE_ID);

        assertThat(pdf).isNotNull().isNotEmpty();
    }

    @Test
    void generateInvoicePdf_notFound_throwsInvoiceNotFoundException() {
        when(invoiceRepository.findById(INVOICE_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> invoiceService.generateInvoicePdf(ACTOR_ID, INVOICE_ID))
                .isInstanceOf(InvoiceNotFoundException.class);
    }

    // ─── updateInvoice ────────────────────────────────────────────────────────

    @Test
    void updateInvoice_success() {
        InvoiceRequestDto request = new InvoiceRequestDto(CONTRACT_ID, BigDecimal.valueOf(6000),
                LocalDateTime.now().plusDays(45), InvoiceStatus.ISSUED, null);

        Invoice invoice = buildInvoice(INVOICE_ID, InvoiceStatus.ISSUED);
        Invoice saved = buildInvoice(INVOICE_ID, InvoiceStatus.ISSUED);
        saved.setTotalAmount(BigDecimal.valueOf(6000));
        InvoiceResponseDto expected = buildResponseDto(INVOICE_ID, InvoiceStatus.ISSUED);

        when(invoiceRepository.findById(INVOICE_ID)).thenReturn(Optional.of(invoice));
        when(invoiceRepository.save(invoice)).thenReturn(saved);
        when(responseDtoMapper.toDto(saved)).thenReturn(expected);

        InvoiceResponseDto result = invoiceService.updateInvoice(ACTOR_ID, INVOICE_ID, request);

        assertThat(result).isNotNull();
        verify(invoiceRepository).save(invoice);
    }

    @Test
    void updateInvoice_notFound_throwsInvoiceNotFoundException() {
        InvoiceRequestDto request = buildRequestDto();
        when(invoiceRepository.findById(INVOICE_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> invoiceService.updateInvoice(ACTOR_ID, INVOICE_ID, request))
                .isInstanceOf(InvoiceNotFoundException.class);
    }

    // ─── deleteInvoice ────────────────────────────────────────────────────────

    @Test
    void deleteInvoice_success() {
        when(invoiceRepository.existsById(INVOICE_ID)).thenReturn(true);
        doNothing().when(invoiceRepository).deleteById(INVOICE_ID);

        invoiceService.deleteInvoice(ACTOR_ID, INVOICE_ID);

        verify(invoiceRepository).deleteById(INVOICE_ID);
    }

    @Test
    void deleteInvoice_notFound_throwsInvoiceNotFoundException() {
        when(invoiceRepository.existsById(INVOICE_ID)).thenReturn(false);

        assertThatThrownBy(() -> invoiceService.deleteInvoice(ACTOR_ID, INVOICE_ID))
                .isInstanceOf(InvoiceNotFoundException.class);
        verify(invoiceRepository, never()).deleteById(any());
    }
}

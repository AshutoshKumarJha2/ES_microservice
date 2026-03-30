package com.cts.eventsphere.vendormanager.controller;

import com.cts.eventsphere.vendormanager.auth.dto.UserPrincipal;
import com.cts.eventsphere.vendormanager.dto.invoice.InvoiceRequestDto;
import com.cts.eventsphere.vendormanager.dto.invoice.InvoiceResponseDto;
import com.cts.eventsphere.vendormanager.model.data.InvoiceStatus;
import com.cts.eventsphere.vendormanager.service.InvoiceService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InvoiceControllerTest {

    @Mock
    private InvoiceService invoiceService;

    @InjectMocks
    private InvoiceController invoiceController;

    private final UserPrincipal user = new UserPrincipal("user-1", "FINANCE_OFFICER", List.of());

    private InvoiceResponseDto buildInvoiceResponse(String id) {
        return new InvoiceResponseDto(id, "c-1", "txn-1", LocalDateTime.now(),
                BigDecimal.valueOf(10000), LocalDateTime.now().plusDays(30),
                InvoiceStatus.ISSUED, LocalDateTime.now(), LocalDateTime.now());
    }

    @Test
    void create_returns201() {
        InvoiceRequestDto request = InvoiceRequestDto.builder()
                .contractId("c-1").totalAmount(BigDecimal.valueOf(10000))
                .dueDate(LocalDateTime.now().plusDays(30)).status(InvoiceStatus.ISSUED).build();
        InvoiceResponseDto expected = buildInvoiceResponse("inv-1");
        when(invoiceService.createInvoice("user-1", request)).thenReturn(expected);

        ResponseEntity<InvoiceResponseDto> response = invoiceController.create(user, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isEqualTo(expected);
    }

    @Test
    void getById_returns200() {
        InvoiceResponseDto expected = buildInvoiceResponse("inv-1");
        when(invoiceService.getInvoiceById("user-1", "inv-1")).thenReturn(expected);

        ResponseEntity<InvoiceResponseDto> response = invoiceController.getById(user, "inv-1");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(expected);
    }

    @Test
    void downloadPdf_returns200WithPdfBytes() {
        byte[] pdfBytes = new byte[]{1, 2, 3};
        when(invoiceService.generateInvoicePdf("user-1", "inv-1")).thenReturn(pdfBytes);

        ResponseEntity<byte[]> response = invoiceController.downloadPdf(user, "inv-1");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(pdfBytes);
    }

    @Test
    void getAll_returns200WithList() {
        when(invoiceService.getAllInvoices("user-1")).thenReturn(List.of(buildInvoiceResponse("inv-1")));

        ResponseEntity<List<InvoiceResponseDto>> response = invoiceController.getAll(user);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).hasSize(1);
    }

    @Test
    void update_returns200() {
        InvoiceRequestDto request = InvoiceRequestDto.builder()
                .contractId("c-1").totalAmount(BigDecimal.valueOf(12000))
                .dueDate(LocalDateTime.now().plusDays(30)).status(InvoiceStatus.PAID).build();
        InvoiceResponseDto expected = buildInvoiceResponse("inv-1");
        when(invoiceService.updateInvoice("user-1", "inv-1", request)).thenReturn(expected);

        ResponseEntity<InvoiceResponseDto> response = invoiceController.update(user, "inv-1", request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    void delete_returns204() {
        doNothing().when(invoiceService).deleteInvoice("user-1", "inv-1");

        ResponseEntity<Void> response = invoiceController.delete(user, "inv-1");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        verify(invoiceService).deleteInvoice("user-1", "inv-1");
    }
}

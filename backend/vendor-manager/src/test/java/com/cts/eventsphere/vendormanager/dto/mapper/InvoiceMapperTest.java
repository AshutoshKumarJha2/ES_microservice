package com.cts.eventsphere.vendormanager.dto.mapper;

import com.cts.eventsphere.vendormanager.dto.invoice.InvoiceRequestDto;
import com.cts.eventsphere.vendormanager.dto.invoice.InvoiceResponseDto;
import com.cts.eventsphere.vendormanager.dto.mapper.invoice.InvoiceRequestDtoMapper;
import com.cts.eventsphere.vendormanager.dto.mapper.invoice.InvoiceResponseDtoMapper;
import com.cts.eventsphere.vendormanager.model.Invoice;
import com.cts.eventsphere.vendormanager.model.data.InvoiceStatus;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class InvoiceMapperTest {

    private final InvoiceRequestDtoMapper requestMapper = new InvoiceRequestDtoMapper();
    private final InvoiceResponseDtoMapper responseMapper = new InvoiceResponseDtoMapper();

    @Test
    void requestMapper_toEntity_mapsAllFields() {
        LocalDateTime dueDate = LocalDateTime.now().plusDays(30);
        InvoiceRequestDto dto = InvoiceRequestDto.builder()
                .contractId("c-1")
                .totalAmount(BigDecimal.valueOf(10000))
                .dueDate(dueDate)
                .status(InvoiceStatus.ISSUED)
                .transactionId("txn-123")
                .build();

        Invoice result = requestMapper.toEntity(dto);

        assertThat(result.getContractId()).isEqualTo("c-1");
        assertThat(result.getTotalAmount()).isEqualByComparingTo(BigDecimal.valueOf(10000));
        assertThat(result.getDueDate()).isEqualTo(dueDate);
        assertThat(result.getStatus()).isEqualTo(InvoiceStatus.ISSUED);
        assertThat(result.getTransactionId()).isEqualTo("txn-123");
    }

    @Test
    void requestMapper_toEntity_nullTransactionId_isNull() {
        InvoiceRequestDto dto = InvoiceRequestDto.builder()
                .contractId("c-2")
                .totalAmount(BigDecimal.valueOf(500))
                .dueDate(LocalDateTime.now().plusDays(7))
                .status(InvoiceStatus.OVERDUE)
                .transactionId(null)
                .build();

        Invoice result = requestMapper.toEntity(dto);

        assertThat(result.getTransactionId()).isNull();
    }

    @Test
    void requestMapper_toEntity_nullInput_returnsNull() {
        assertThat(requestMapper.toEntity(null)).isNull();
    }

    @Test
    void responseMapper_toDto_mapsAllFields() {
        LocalDateTime now = LocalDateTime.now();
        Invoice invoice = new Invoice();
        invoice.setInvoiceId("inv-99");
        invoice.setContractId("c-1");
        invoice.setTransactionId("txn-456");
        invoice.setIssueDate(now);
        invoice.setTotalAmount(BigDecimal.valueOf(8000));
        invoice.setDueDate(now.plusDays(30));
        invoice.setStatus(InvoiceStatus.PAID);
        invoice.setCreatedAt(now);
        invoice.setUpdatedAt(now);

        InvoiceResponseDto result = responseMapper.toDto(invoice);

        assertThat(result.invoiceId()).isEqualTo("inv-99");
        assertThat(result.contractId()).isEqualTo("c-1");
        assertThat(result.transactionId()).isEqualTo("txn-456");
        assertThat(result.issueDate()).isEqualTo(now);
        assertThat(result.totalAmount()).isEqualByComparingTo(BigDecimal.valueOf(8000));
        assertThat(result.dueDate()).isEqualTo(now.plusDays(30));
        assertThat(result.status()).isEqualTo(InvoiceStatus.PAID);
        assertThat(result.createdAt()).isEqualTo(now);
        assertThat(result.updatedAt()).isEqualTo(now);
    }

    @Test
    void responseMapper_toDto_nullInput_returnsNull() {
        assertThat(responseMapper.toDto(null)).isNull();
    }
}

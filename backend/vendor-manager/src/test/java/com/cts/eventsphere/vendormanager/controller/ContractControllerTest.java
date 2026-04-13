package com.cts.eventsphere.vendormanager.controller;

import com.cts.eventsphere.vendormanager.auth.dto.UserPrincipal;
import com.cts.eventsphere.vendormanager.dto.contract.ContractRequestDto;
import com.cts.eventsphere.vendormanager.dto.contract.ContractResponseDto;
import com.cts.eventsphere.vendormanager.dto.delivery.DeliveryRequestDto;
import com.cts.eventsphere.vendormanager.dto.delivery.DeliveryResponseDto;
import com.cts.eventsphere.vendormanager.dto.invoice.InvoiceRequestDto;
import com.cts.eventsphere.vendormanager.dto.invoice.InvoiceResponseDto;
import com.cts.eventsphere.vendormanager.model.data.ContractStatus;
import com.cts.eventsphere.vendormanager.model.data.DeliveryStatus;
import com.cts.eventsphere.vendormanager.model.data.InvoiceStatus;
import com.cts.eventsphere.vendormanager.service.ContractService;
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
class ContractControllerTest {

    @Mock
    private ContractService contractService;

    @Mock
    private InvoiceService invoiceService;

    @InjectMocks
    private ContractController contractController;

    private final UserPrincipal user = new UserPrincipal("user-1", "ORGANIZER", List.of());

    private ContractResponseDto buildContractResponse(String id) {
        LocalDateTime now = LocalDateTime.now();
        return new ContractResponseDto(id, "v-1", "e-1", now, now.plusDays(30),
                BigDecimal.valueOf(5000), ContractStatus.ACTIVE, now, now);
    }

    private InvoiceResponseDto buildInvoiceResponse(String id) {
        LocalDateTime now = LocalDateTime.now();
        return new InvoiceResponseDto(id, "c-1", null, now, BigDecimal.valueOf(5000),
                now.plusDays(30), InvoiceStatus.ISSUED, now, now);
    }

    @Test
    void create_returns201() {
        LocalDateTime now = LocalDateTime.now();
        ContractRequestDto request = new ContractRequestDto("v-1", "e-1", now, now.plusDays(30),
                BigDecimal.valueOf(5000), ContractStatus.ACTIVE);
        ContractResponseDto expected = buildContractResponse("c-1");
        when(contractService.createContract("user-1", request)).thenReturn(expected);

        ResponseEntity<ContractResponseDto> response = contractController.create(user, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isEqualTo(expected);
    }

    @Test
    void createInvoice_returns201() {
        InvoiceRequestDto dto = InvoiceRequestDto.builder()
                .contractId("c-1").totalAmount(BigDecimal.valueOf(5000))
                .dueDate(LocalDateTime.now().plusDays(30)).status(InvoiceStatus.ISSUED).build();
        InvoiceResponseDto expected = buildInvoiceResponse("inv-1");
        when(contractService.createInvoice("user-1", "c-1", dto)).thenReturn(expected);

        ResponseEntity<InvoiceResponseDto> response = contractController.createInvoice(user, "c-1", dto);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isEqualTo(expected);
    }

    @Test
    void addDelivery_returns201WithDeliveryResponse() {
        DeliveryRequestDto dto = new DeliveryRequestDto("inv-1", "Tables", 5,
                LocalDateTime.now().plusDays(3), DeliveryStatus.SCHEDULED, "TRK-001");
        LocalDateTime now = LocalDateTime.now();
        DeliveryResponseDto expected = new DeliveryResponseDto(
                "d-1", "inv-1", "Tables", 5, now.plusDays(3), DeliveryStatus.SCHEDULED, "TRK-001", now, now);
        when(contractService.addDeliverable("user-1", "c-1", dto)).thenReturn(expected);

        ResponseEntity<DeliveryResponseDto> response = contractController.addDelivery(user, "c-1", dto);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isEqualTo(expected);
    }

    @Test
    void handlePaymentCallback_returns200() {
        InvoiceResponseDto expected = buildInvoiceResponse("inv-1");
        when(invoiceService.processInvoiceAfterPayment(eq("SYSTEM_AUTO"), eq("txn-abc"), any(InvoiceRequestDto.class)))
                .thenReturn(expected);

        ResponseEntity<InvoiceResponseDto> response = contractController.handlePaymentCallback(
                "c-1", "txn-abc", BigDecimal.valueOf(5000));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(expected);
    }

    @Test
    void getById_returns200() {
        ContractResponseDto expected = buildContractResponse("c-1");
        when(contractService.getContractById("user-1", "c-1")).thenReturn(expected);

        ResponseEntity<ContractResponseDto> response = contractController.getById(user, "c-1");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(expected);
    }

    @Test
    void getAll_returns200WithList() {
        when(contractService.getAllContracts("user-1")).thenReturn(List.of(buildContractResponse("c-1")));

        ResponseEntity<List<ContractResponseDto>> response = contractController.getAll(user);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).hasSize(1);
    }

    @Test
    void updateStatus_returns200() {
        ContractResponseDto expected = buildContractResponse("c-1");
        when(contractService.updateContractStatus("user-1", "c-1", ContractStatus.COMPLETED)).thenReturn(expected);

        ResponseEntity<ContractResponseDto> response = contractController.updateStatus(user, "c-1", ContractStatus.COMPLETED);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    void delete_returns204() {
        doNothing().when(contractService).deleteContract("user-1", "c-1");

        ResponseEntity<Void> response = contractController.delete(user, "c-1");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        verify(contractService).deleteContract("user-1", "c-1");
    }
}

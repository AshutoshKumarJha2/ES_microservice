package com.cts.eventsphere.vendormanager.service;

import com.cts.eventsphere.vendormanager.client.EventClient;
import com.cts.eventsphere.vendormanager.dto.contract.ContractRequestDto;
import com.cts.eventsphere.vendormanager.dto.contract.ContractResponseDto;
import com.cts.eventsphere.vendormanager.dto.delivery.DeliveryRequestDto;
import com.cts.eventsphere.vendormanager.dto.invoice.InvoiceRequestDto;
import com.cts.eventsphere.vendormanager.dto.invoice.InvoiceResponseDto;
import com.cts.eventsphere.vendormanager.dto.mapper.contract.ContractRequestDtoMapper;
import com.cts.eventsphere.vendormanager.dto.mapper.contract.ContractResponseDtoMapper;
import com.cts.eventsphere.vendormanager.exception.contract.ContractNotFoundException;
import com.cts.eventsphere.vendormanager.exception.event.EventNotFoundException;
import com.cts.eventsphere.vendormanager.exception.vendor.VendorNotFoundException;
import com.cts.eventsphere.vendormanager.model.Contract;
import com.cts.eventsphere.vendormanager.model.data.ContractStatus;
import com.cts.eventsphere.vendormanager.model.data.InvoiceStatus;
import com.cts.eventsphere.vendormanager.repository.ContractRepository;
import com.cts.eventsphere.vendormanager.repository.VendorRepository;
import com.cts.eventsphere.vendormanager.service.impl.ContractServiceImpl;
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
class ContractServiceImplTest {

    @Mock private ContractRepository contractRepository;
    @Mock private VendorRepository vendorRepository;
    @Mock private ContractRequestDtoMapper requestDtoMapper;
    @Mock private ContractResponseDtoMapper responseDtoMapper;
    @Mock private DeliveryService deliveryService;
    @Mock private InvoiceService invoiceService;
    @Mock private EventClient eventClient;

    @InjectMocks
    private ContractServiceImpl contractService;

    private static final String ACTOR_ID = "actor-1";
    private static final String CONTRACT_ID = "contract-100";
    private static final String VENDOR_ID = "vendor-200";
    private static final String EVENT_ID = "event-300";

    private Contract buildContract(String id, ContractStatus status) {
        Contract c = new Contract();
        c.setContractId(id);
        c.setVendorId(VENDOR_ID);
        c.setEventId(EVENT_ID);
        c.setStartDate(LocalDateTime.now());
        c.setEndDate(LocalDateTime.now().plusMonths(1));
        c.setValue(BigDecimal.valueOf(10000));
        c.setStatus(status);
        c.setCreatedAt(LocalDateTime.now());
        c.setUpdatedAt(LocalDateTime.now());
        return c;
    }

    private ContractResponseDto buildResponseDto(String id, ContractStatus status) {
        return new ContractResponseDto(id, VENDOR_ID, EVENT_ID,
                LocalDateTime.now(), LocalDateTime.now().plusMonths(1),
                BigDecimal.valueOf(10000), status, LocalDateTime.now(), LocalDateTime.now());
    }

    // ─── createContract ───────────────────────────────────────────────────────

    @Test
    void createContract_success() {
        ContractRequestDto request = new ContractRequestDto(VENDOR_ID, EVENT_ID,
                LocalDateTime.now(), LocalDateTime.now().plusMonths(1),
                BigDecimal.valueOf(10000), ContractStatus.DRAFT);

        when(eventClient.checkEventExists(EVENT_ID)).thenReturn(true);
        when(vendorRepository.existsById(VENDOR_ID)).thenReturn(true);

        Contract contract = buildContract(null, ContractStatus.DRAFT);
        Contract saved = buildContract(CONTRACT_ID, ContractStatus.DRAFT);
        ContractResponseDto expected = buildResponseDto(CONTRACT_ID, ContractStatus.DRAFT);

        when(requestDtoMapper.toEntity(request)).thenReturn(contract);
        when(contractRepository.save(contract)).thenReturn(saved);
        when(responseDtoMapper.toDto(saved)).thenReturn(expected);

        ContractResponseDto result = contractService.createContract(ACTOR_ID, request);

        assertThat(result.contractId()).isEqualTo(CONTRACT_ID);
        assertThat(result.status()).isEqualTo(ContractStatus.DRAFT);
    }

    @Test
    void createContract_eventNotFound_throwsEventNotFoundException() {
        ContractRequestDto request = new ContractRequestDto(VENDOR_ID, EVENT_ID,
                LocalDateTime.now(), LocalDateTime.now().plusMonths(1),
                BigDecimal.valueOf(10000), ContractStatus.DRAFT);

        when(eventClient.checkEventExists(EVENT_ID)).thenReturn(false);

        assertThatThrownBy(() -> contractService.createContract(ACTOR_ID, request))
                .isInstanceOf(EventNotFoundException.class);
        verify(contractRepository, never()).save(any());
    }

    @Test
    void createContract_vendorNotFound_throwsVendorNotFoundException() {
        ContractRequestDto request = new ContractRequestDto(VENDOR_ID, EVENT_ID,
                LocalDateTime.now(), LocalDateTime.now().plusMonths(1),
                BigDecimal.valueOf(10000), ContractStatus.DRAFT);

        when(eventClient.checkEventExists(EVENT_ID)).thenReturn(true);
        when(vendorRepository.existsById(VENDOR_ID)).thenReturn(false);

        assertThatThrownBy(() -> contractService.createContract(ACTOR_ID, request))
                .isInstanceOf(VendorNotFoundException.class);
        verify(contractRepository, never()).save(any());
    }

    // ─── addDeliverable ───────────────────────────────────────────────────────

    @Test
    void addDeliverable_contractExists_callsDeliveryService() {
        DeliveryRequestDto dto = mock(DeliveryRequestDto.class);
        when(contractRepository.existsById(CONTRACT_ID)).thenReturn(true);

        contractService.addDeliverable(ACTOR_ID, CONTRACT_ID, dto);

        verify(deliveryService).createDelivery(ACTOR_ID, dto);
    }

    @Test
    void addDeliverable_contractNotFound_throwsContractNotFoundException() {
        DeliveryRequestDto dto = mock(DeliveryRequestDto.class);
        when(contractRepository.existsById(CONTRACT_ID)).thenReturn(false);

        assertThatThrownBy(() -> contractService.addDeliverable(ACTOR_ID, CONTRACT_ID, dto))
                .isInstanceOf(ContractNotFoundException.class);
        verify(deliveryService, never()).createDelivery(any(), any());
    }

    // ─── createInvoice ────────────────────────────────────────────────────────

    @Test
    void createInvoice_invoicePaid_setsContractCompleted() {
        Contract contract = buildContract(CONTRACT_ID, ContractStatus.ACTIVE);
        when(contractRepository.findById(CONTRACT_ID)).thenReturn(Optional.of(contract));

        InvoiceRequestDto dto = mock(InvoiceRequestDto.class);
        InvoiceResponseDto invoiceResponse = new InvoiceResponseDto("inv-1", CONTRACT_ID, null,
                LocalDateTime.now(), BigDecimal.valueOf(10000), LocalDateTime.now(),
                InvoiceStatus.PAID, LocalDateTime.now(), LocalDateTime.now());

        when(invoiceService.generateInvoice(ACTOR_ID, CONTRACT_ID, dto)).thenReturn(invoiceResponse);
        when(contractRepository.save(any(Contract.class))).thenReturn(contract);

        InvoiceResponseDto result = contractService.createInvoice(ACTOR_ID, CONTRACT_ID, dto);

        assertThat(result.status()).isEqualTo(InvoiceStatus.PAID);
        assertThat(contract.getStatus()).isEqualTo(ContractStatus.COMPLETED);
    }

    @Test
    void createInvoice_invoiceIssued_setsContractActive() {
        Contract contract = buildContract(CONTRACT_ID, ContractStatus.DRAFT);
        when(contractRepository.findById(CONTRACT_ID)).thenReturn(Optional.of(contract));

        InvoiceRequestDto dto = mock(InvoiceRequestDto.class);
        InvoiceResponseDto invoiceResponse = new InvoiceResponseDto("inv-2", CONTRACT_ID, null,
                LocalDateTime.now(), BigDecimal.valueOf(10000), LocalDateTime.now(),
                InvoiceStatus.ISSUED, LocalDateTime.now(), LocalDateTime.now());

        when(invoiceService.generateInvoice(ACTOR_ID, CONTRACT_ID, dto)).thenReturn(invoiceResponse);
        when(contractRepository.save(any(Contract.class))).thenReturn(contract);

        contractService.createInvoice(ACTOR_ID, CONTRACT_ID, dto);

        assertThat(contract.getStatus()).isEqualTo(ContractStatus.ACTIVE);
    }

    @Test
    void createInvoice_contractNotFound_throwsContractNotFoundException() {
        when(contractRepository.findById(CONTRACT_ID)).thenReturn(Optional.empty());
        InvoiceRequestDto dto = mock(InvoiceRequestDto.class);

        assertThatThrownBy(() -> contractService.createInvoice(ACTOR_ID, CONTRACT_ID, dto))
                .isInstanceOf(ContractNotFoundException.class);
    }

    // ─── getContractById ──────────────────────────────────────────────────────

    @Test
    void getContractById_found() {
        Contract contract = buildContract(CONTRACT_ID, ContractStatus.DRAFT);
        ContractResponseDto expected = buildResponseDto(CONTRACT_ID, ContractStatus.DRAFT);

        when(contractRepository.findById(CONTRACT_ID)).thenReturn(Optional.of(contract));
        when(responseDtoMapper.toDto(contract)).thenReturn(expected);

        ContractResponseDto result = contractService.getContractById(ACTOR_ID, CONTRACT_ID);

        assertThat(result.contractId()).isEqualTo(CONTRACT_ID);
    }

    @Test
    void getContractById_notFound_throwsContractNotFoundException() {
        when(contractRepository.findById(CONTRACT_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> contractService.getContractById(ACTOR_ID, CONTRACT_ID))
                .isInstanceOf(ContractNotFoundException.class);
    }

    // ─── getAllContracts ──────────────────────────────────────────────────────

    @Test
    void getAllContracts_returnsList() {
        Contract c1 = buildContract("c1", ContractStatus.DRAFT);
        Contract c2 = buildContract("c2", ContractStatus.ACTIVE);
        ContractResponseDto dto1 = buildResponseDto("c1", ContractStatus.DRAFT);
        ContractResponseDto dto2 = buildResponseDto("c2", ContractStatus.ACTIVE);

        when(contractRepository.findAll()).thenReturn(List.of(c1, c2));
        when(responseDtoMapper.toDto(c1)).thenReturn(dto1);
        when(responseDtoMapper.toDto(c2)).thenReturn(dto2);

        List<ContractResponseDto> result = contractService.getAllContracts(ACTOR_ID);

        assertThat(result).hasSize(2);
    }

    @Test
    void getAllContracts_empty_returnsEmptyList() {
        when(contractRepository.findAll()).thenReturn(List.of());

        assertThat(contractService.getAllContracts(ACTOR_ID)).isEmpty();
    }

    // ─── updateContractStatus ─────────────────────────────────────────────────

    @Test
    void updateContractStatus_success() {
        Contract contract = buildContract(CONTRACT_ID, ContractStatus.DRAFT);
        Contract saved = buildContract(CONTRACT_ID, ContractStatus.ACTIVE);
        ContractResponseDto expected = buildResponseDto(CONTRACT_ID, ContractStatus.ACTIVE);

        when(contractRepository.findById(CONTRACT_ID)).thenReturn(Optional.of(contract));
        when(contractRepository.save(contract)).thenReturn(saved);
        when(responseDtoMapper.toDto(saved)).thenReturn(expected);

        ContractResponseDto result = contractService.updateContractStatus(ACTOR_ID, CONTRACT_ID, ContractStatus.ACTIVE);

        assertThat(result.status()).isEqualTo(ContractStatus.ACTIVE);
    }

    @Test
    void updateContractStatus_notFound_throwsContractNotFoundException() {
        when(contractRepository.findById(CONTRACT_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> contractService.updateContractStatus(ACTOR_ID, CONTRACT_ID, ContractStatus.ACTIVE))
                .isInstanceOf(ContractNotFoundException.class);
    }

    // ─── updateContract ───────────────────────────────────────────────────────

    @Test
    void updateContract_success() {
        ContractRequestDto request = new ContractRequestDto(VENDOR_ID, EVENT_ID,
                LocalDateTime.now().plusDays(1), LocalDateTime.now().plusMonths(2),
                BigDecimal.valueOf(20000), ContractStatus.ACTIVE);

        Contract contract = buildContract(CONTRACT_ID, ContractStatus.DRAFT);
        Contract saved = buildContract(CONTRACT_ID, ContractStatus.DRAFT);
        saved.setValue(BigDecimal.valueOf(20000));
        ContractResponseDto expected = buildResponseDto(CONTRACT_ID, ContractStatus.DRAFT);

        when(contractRepository.findById(CONTRACT_ID)).thenReturn(Optional.of(contract));
        when(contractRepository.save(contract)).thenReturn(saved);
        when(responseDtoMapper.toDto(saved)).thenReturn(expected);

        ContractResponseDto result = contractService.updateContract(ACTOR_ID, CONTRACT_ID, request);

        assertThat(result).isNotNull();
        verify(contractRepository).save(contract);
    }

    @Test
    void updateContract_notFound_throwsContractNotFoundException() {
        ContractRequestDto request = new ContractRequestDto(VENDOR_ID, EVENT_ID,
                LocalDateTime.now(), LocalDateTime.now().plusMonths(1),
                BigDecimal.valueOf(5000), ContractStatus.DRAFT);
        when(contractRepository.findById(CONTRACT_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> contractService.updateContract(ACTOR_ID, CONTRACT_ID, request))
                .isInstanceOf(ContractNotFoundException.class);
    }

    // ─── deleteContract ───────────────────────────────────────────────────────

    @Test
    void deleteContract_success() {
        when(contractRepository.existsById(CONTRACT_ID)).thenReturn(true);
        doNothing().when(contractRepository).deleteById(CONTRACT_ID);

        contractService.deleteContract(ACTOR_ID, CONTRACT_ID);

        verify(contractRepository).deleteById(CONTRACT_ID);
    }

    @Test
    void deleteContract_notFound_throwsContractNotFoundException() {
        when(contractRepository.existsById(CONTRACT_ID)).thenReturn(false);

        assertThatThrownBy(() -> contractService.deleteContract(ACTOR_ID, CONTRACT_ID))
                .isInstanceOf(ContractNotFoundException.class);
        verify(contractRepository, never()).deleteById(any());
    }
}

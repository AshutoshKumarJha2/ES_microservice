package com.cts.eventsphere.vendormanager.controller;

import com.cts.eventsphere.vendormanager.auth.dto.UserPrincipal;
import com.cts.eventsphere.vendormanager.dto.contract.ContractRequestDto;
import com.cts.eventsphere.vendormanager.dto.contract.ContractResponseDto;
import com.cts.eventsphere.vendormanager.dto.delivery.DeliveryRequestDto;
import com.cts.eventsphere.vendormanager.dto.delivery.DeliveryResponseDto;
import com.cts.eventsphere.vendormanager.dto.invoice.InvoiceRequestDto;
import com.cts.eventsphere.vendormanager.dto.invoice.InvoiceResponseDto;
import com.cts.eventsphere.vendormanager.model.Invoice;
import com.cts.eventsphere.vendormanager.model.data.ContractStatus;
import com.cts.eventsphere.vendormanager.service.ContractService;
import com.cts.eventsphere.vendormanager.service.InvoiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Rest Controller for Contract entity management.
 * Provides endpoints for creating, updating, and processing contract-related tasks. [cite: 34]
 *
 * @author 2480177
 * @version 1.0
 * @since 03-03-2026
 */

@RestController
@RequestMapping("/contracts")
@RequiredArgsConstructor
@Slf4j
@Validated
public class ContractController {

    private final ContractService contractService;
    private final InvoiceService invoiceService;

    /**
     * Initiates a new contract record in the system. [cite: 51]
     * Restricted to users with the 'ORGANIZER' role.
     *
     * @param user The currently authenticated user's details representing the actor.
     * @param request the contract details to be created, validated by @Valid [cite: 54]
     * @return the created contract response DTO wrapped in a ResponseEntity [cite: 55]
     */
    @PostMapping
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<ContractResponseDto> create(@AuthenticationPrincipal UserPrincipal user, @Valid @RequestBody ContractRequestDto request) {
        var actorId = user.userId();
        log.info("REST request to create contract for vendor: {} by actorId={}",request.vendorId(), actorId);
        return new ResponseEntity<>(contractService.createContract(user.userId(),request), HttpStatus.CREATED);
    }

    /**
     * Creates a new invoice associated with a specific contract. [cite: 51]
     *
     * @param user The currently authenticated user's details representing the actor.
     * @param contractId unique identifier of the contract [cite: 54]
     * @param dto the invoice details to be processed [cite: 54]
     * @return the generated invoice details [cite: 55]
     */
    @PostMapping("/{contractId}/invoice")
    @PreAuthorize("hasAnyRole('FINANCE_OFFICER')")
    public ResponseEntity<InvoiceResponseDto> createInvoice(@AuthenticationPrincipal UserPrincipal user, @PathVariable String contractId, @Valid @RequestBody InvoiceRequestDto dto) {
        var actorId = user.userId();
        log.info("REST request to create invoice for contract with ID: {} by actorId={}",contractId,actorId);
        return new ResponseEntity<>(contractService.createInvoice(user.userId(),contractId, dto), HttpStatus.CREATED);
    }

    /**
     * Adds a new deliverable item to an existing contract. [cite: 51]
     *
     * @param user The currently authenticated user's details representing the actor.
     * @param contractId unique identifier of the contract [cite: 54]
     * @param dto the delivery details to be added [cite: 54]
     * @return a success message confirming the delivery addition [cite: 55]
     */
    @PostMapping("/{contractId}/deliveries")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<DeliveryResponseDto> addDelivery(@AuthenticationPrincipal UserPrincipal user, @PathVariable String contractId, @Valid @RequestBody DeliveryRequestDto dto) {
        var actorId = user.userId();
        log.info("REST request to add delivery for contract with ID: {} by actorId={}",contractId, actorId);
        return ResponseEntity.status(HttpStatus.CREATED).body(contractService.addDeliverable(user.userId(), contractId, dto));
    }

    @PostMapping("/{contractId}/payment-callback")
    public ResponseEntity<InvoiceResponseDto> handlePaymentCallback(
            @PathVariable String contractId,
            @RequestParam String transactionId,
            @RequestParam BigDecimal amount) {

        log.info("Payment approved for contract {}. Verifying transaction: {}", contractId, transactionId);
        InvoiceRequestDto autoDto = InvoiceRequestDto.builder()
                .contractId(contractId)
                .totalAmount(amount)
                .dueDate(LocalDateTime.now().plusDays(30))
                .transactionId(transactionId) // Pass the ID here
                .build();

        InvoiceResponseDto response = invoiceService.processInvoiceAfterPayment("SYSTEM_AUTO", transactionId, autoDto);

        return ResponseEntity.ok(response);
    }

    /**
     * Retrieves a single contract by its unique ID. [cite: 51]
     *
     * @param user The currently authenticated user's details representing the actor.
     * @param id the unique identifier of the contract [cite: 54]
     * @return the contract details wrapped in a ResponseEntity [cite: 55]
     */
    @GetMapping("/{id}")
    public ResponseEntity<ContractResponseDto> getById(@AuthenticationPrincipal UserPrincipal user,@PathVariable String id) {
        var actorId = user.userId();
        log.info("REST request to fetch contract with ID={} by actorId={}", id, actorId);
        return ResponseEntity.ok(contractService.getContractById(user.userId(),id));
    }

    /**
     * Fetches a list of all contracts available in the system. [cite: 51]
     *
     * @param user The currently authenticated user's details representing the actor.
     * @return a list of all contract response DTOs [cite: 55]
     */
    @GetMapping
    public ResponseEntity<List<ContractResponseDto>> getAll(@AuthenticationPrincipal UserPrincipal user) {
        var actorId = user.userId();
        log.info("REST request to fetch all contracts by actorId={}", actorId);
        return ResponseEntity.ok(contractService.getAllContracts(user.userId()));
    }

    /**
     * Updates only the status of an existing contract. [cite: 51]
     *
     * @param user The currently authenticated user's details representing the actor.
     * @param id the unique identifier of the contract [cite: 54]
     * @param status the new status to apply [cite: 54]
     * @return the updated contract details [cite: 55]
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ORGANIZER', 'VENDOR')")
    public ResponseEntity<ContractResponseDto> updateStatus(
            @AuthenticationPrincipal UserPrincipal user,
            @PathVariable String id,
            @RequestParam ContractStatus status) {

        var actorId = user.userId();
        log.info("REST request to update status for contract ID={} to {} by actorId={}", id, status, actorId);
        return ResponseEntity.ok(contractService.updateContractStatus(user.userId(),id, status));
    }

    /**
     * Performs a full update of an existing contract's information. [cite: 51]
     * Overwrites vendor, event, duration, and financial details. [cite: 52]
     *
     * @param user The currently authenticated user's details representing the actor.
     * @param id the unique identifier of the contract to update [cite: 54]
     * @param request the updated contract details wrapped in a DTO [cite: 54]
     * @return the updated contract response DTO wrapped in a ResponseEntity [cite: 55]
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<ContractResponseDto> update(
            @AuthenticationPrincipal UserPrincipal user,
            @PathVariable String id,
            @Valid @RequestBody ContractRequestDto request){

        var actorId = user.userId();
        log.info("REST request to update contract with ID={} by actorId={}", id, actorId);
        return ResponseEntity.ok(contractService.updateContract(user.userId(),id, request));
    }

    /**
     * Deletes a contract record from the system permanently. [cite: 51]
     * Restricted to Admins.
     *
     * @param user The currently authenticated user's details representing the actor.
     * @param id the unique identifier of the contract to remove [cite: 54]
     * @return ResponseEntity with No Content status [cite: 55]
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal UserPrincipal user,@PathVariable String id) {
        var actorId = user.userId();
        log.info("REST request to delete contract with ID={} by actorId={}", id, actorId);
        contractService.deleteContract(user.userId(),id);
        return ResponseEntity.noContent().build();
    }
}


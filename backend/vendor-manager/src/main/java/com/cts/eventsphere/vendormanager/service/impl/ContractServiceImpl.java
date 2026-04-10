package com.cts.eventsphere.vendormanager.service.impl;

import com.cts.eventsphere.vendormanager.client.EventClient;
import com.cts.eventsphere.vendormanager.dto.contract.ContractRequestDto;
import com.cts.eventsphere.vendormanager.dto.contract.ContractResponseDto;
import com.cts.eventsphere.vendormanager.dto.delivery.DeliveryRequestDto;
import com.cts.eventsphere.vendormanager.dto.delivery.DeliveryResponseDto;
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
import com.cts.eventsphere.vendormanager.service.ContractService;
import com.cts.eventsphere.vendormanager.service.DeliveryService;
import com.cts.eventsphere.vendormanager.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service Implementation for Contract operations.
 * Handles business logic for contract lifecycle management including creation,
 * status transitions, and integration with delivery and billing services.
 *
 * @author 2480177
 * @version 1.0
 * @since 03-03-2026
 */

@Service
@RequiredArgsConstructor
@Slf4j
public class ContractServiceImpl implements ContractService {

    private final ContractRepository contractRepository;
    private final VendorRepository vendorRepository;
    private final ContractRequestDtoMapper requestDtoMapper;
    private final ContractResponseDtoMapper responseDtoMapper;

    private final DeliveryService deliveryService;
    private final InvoiceService invoiceService;

    private final EventClient eventClient;
//    private final AuditService auditService;
//    private final NotificationService notificationService;

    /**
     * Creates a new contract and persists it to the database.
     * Uses mapper to convert incoming DTO to a persistence entity.
     *
     * @param request the contract details provided by the organizer
     * @return the created contract details as a response DTO
     */
    @Override
    @Transactional
    public ContractResponseDto createContract(String actorId, ContractRequestDto request) {
        log.info("Attempting to create a new contract for vendor: {} by actorId={}", request.vendorId(), actorId);

        if (!eventClient.checkEventExists(request.eventId())) {
            throw new EventNotFoundException("Event not found with ID: " + request.eventId());
        }

        if (!vendorRepository.existsById(request.vendorId())) {
            throw new VendorNotFoundException("Vendor not found with ID: " + request.vendorId());
        }

        Contract saved = contractRepository.save(requestDtoMapper.toEntity(request));

        log.info("Successfully created contract with ID: {} by actorId={}", saved.getContractId(), actorId);

        // auditService.logAudit(actorId, AuditAction.CREATE, Contract.class, saved.getContractId());

        return responseDtoMapper.toDto(saved);
    }

    /**
     * Adds a deliverable item to an existing contract.
     * Validates contract existence before delegating to DeliveryService.
     *
     * @param contractId the unique identifier of the contract
     * @param dto the delivery details to be recorded
     * @throws ContractNotFoundException if the contract ID does not exist
     */
    @Override
    @Transactional
    public DeliveryResponseDto addDeliverable(String actorId, String contractId, DeliveryRequestDto dto) {
        log.info("Attempting to add a new deliverable for contract with ID: {} by actorId={}", contractId, actorId);
        validateContract(contractId);
        DeliveryResponseDto result = deliveryService.createDelivery(actorId, dto);
        log.info("Successfully added a deliverable for contract with ID: {} by actorId={}", contractId, actorId);
        return result;
//        auditService.logAudit(
//                actorId,
//                AuditAction.CREATE,
//                Contract.class,
//                contractId
//        );

//        notificationService.sendNotification(
//                actorId,
//                "Delivery added for Contract ID: " + contractId,
//                "DELIVERY_ADDED"
//        );
    }

    /**
     * Generates an invoice for an existing contract.
     * Validates contract existence before delegating to InvoiceService.
     *
     * @param contractId the unique identifier of the contract
     * @param dto the billing details for the invoice
     * @return the generated invoice response DTO
     * @throws ContractNotFoundException if the contract ID does not exist
     */
    @Override
    @Transactional
    public InvoiceResponseDto createInvoice(String actorId, String contractId, InvoiceRequestDto dto) {
        log.info("Processing invoice for contract: {} by actorId: {}", contractId, actorId);

        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new ContractNotFoundException("Contract not found: " + contractId));

        InvoiceResponseDto invoice = invoiceService.generateInvoice(actorId, contractId, dto);

        if (invoice.status() == InvoiceStatus.PAID) {
            contract.setStatus(ContractStatus.COMPLETED);
        } else {
            contract.setStatus(ContractStatus.ACTIVE);
        }

        contractRepository.save(contract);
        return invoice;
    }

    /**
     * Retrieves a specific contract by its unique identifier.
     *
     * @param contractId the ID of the contract to retrieve
     * @return the contract details as a response DTO
     * @throws ContractNotFoundException if the ID is not found in the database
     */
    @Override
    @Transactional(readOnly = true)
    public ContractResponseDto getContractById(String actorId, String contractId) {
        log.info("Fetching contract details for ID={} by actorId={}", contractId, actorId);

        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new ContractNotFoundException("Contract not found for ID: " + contractId));
//        auditService.logAudit(
//                actorId,
//                AuditAction.READ,
//                Contract.class,
//                contractId
//        );
        return responseDtoMapper.toDto(contract);
    }

    /**
     * Retrieves all contracts currently stored in the system.
     *
     * @return a list of all contract response DTOs
     */
    @Override
    @Transactional(readOnly = true)
    public List<ContractResponseDto> getAllContracts(String actorId) {
        log.info("Fetching all contracts from database by actorId={}", actorId);
        return contractRepository.findAll().stream()
//                .peek(c ->
//                        auditService.logAudit(
//                                actorId,
//                                AuditAction.READ,
//                                Contract.class,
//                                c.getContractId()
//                        )
//                )
                .map(responseDtoMapper::toDto)
                .toList();
    }

    /**
     * Updates the status of an existing contract record.
     *
     * @param contractId the unique identifier of the contract
     * @param status the new status to be applied
     * @return the updated contract details
     * @throws ContractNotFoundException if the contract record does not exist
     */
    @Override
    @Transactional
    public ContractResponseDto updateContractStatus(String actorId, String contractId, ContractStatus status) {
        log.info("Attempting to update status for contract ID: {} to {} by actorId={}", contractId, status, actorId);

        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new ContractNotFoundException("Contract not found for ID: " + contractId));

        contract.setStatus(status);

        log.info("Successfully updated contract status for ID: {} by actorId={}", contractId, actorId);
//        auditService.logAudit(
//                actorId,
//                AuditAction.UPDATE,
//                Contract.class,
//                contractId
//        );
//
//        notificationService.sendNotification(
//                actorId,
//                "Contract status updated to " + status +
//                        ". Contract ID: " + contractId,
//                "CONTRACT_STATUS_UPDATED"
//        );

        return responseDtoMapper.toDto(contractRepository.save(contract));
    }

    /**
     * Updates the comprehensive details of an existing contract record.
     * Overwrites duration and value based on the provided request.
     *
     * @param contractId the unique identifier of the contract to update
     * @param request the new contract details provided via DTO
     * @return the updated contract details as a response DTO
     * @throws ContractNotFoundException if the contract record does not exist in the database
     */
    @Override
    @Transactional
    public ContractResponseDto updateContract(String actorId, String contractId, ContractRequestDto request) {
        log.info("Attempting to update details for contract ID: {} by actorId={}", contractId, actorId);

        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new ContractNotFoundException("Contract not found for ID: " + contractId));

        contract.setStartDate(request.startDate());
        contract.setEndDate(request.endDate());
        contract.setValue(request.value());

        log.info("Successfully updated contract details for ID: {} by actorId={}", contractId, actorId);
//        auditService.logAudit(
//                actorId,
//                AuditAction.UPDATE,
//                Contract.class,
//                contractId
//        );
//
//        notificationService.sendNotification(
//                actorId,
//                "Contract details updated. Contract ID: " + contractId,
//                "CONTRACT_UPDATED"
//        );

        return responseDtoMapper.toDto(contractRepository.save(contract));
    }

    /**
     * Removes a contract record from the system based on the provided ID.
     *
     * @param contractId the unique identifier of the contract to delete
     * @throws ContractNotFoundException if the contract is not found
     */
    @Override
    @Transactional
    public void deleteContract(String actorId, String contractId) {
        log.info("Attempting to delete contract ID: {} by actorId={}", contractId, actorId);

        if (!contractRepository.existsById(contractId)) {
            throw new ContractNotFoundException("Contract not found for ID :" + contractId);
        }

        contractRepository.deleteById(contractId);
        log.info("Successfully deleted contract ID: {} by actorId={}", contractId, actorId);
//        auditService.logAudit(
//                actorId,
//                AuditAction.DELETE,
//                Contract.class,
//                contractId
//        );
//
//        notificationService.sendNotification(
//                actorId,
//                "Contract deleted. Contract ID: " + contractId,
//                "CONTRACT_DELETED"
//        );
    }

    /**
     * Internal helper method to validate the existence of a contract.
     *
     * @param contractId the unique identifier to check
     * @throws ContractNotFoundException if the contract does not exist
     */
    private void validateContract(String contractId) {
        if (!contractRepository.existsById(contractId)) {
            log.error("Validation failed: Contract {} not found", contractId);
            throw new ContractNotFoundException("Contract not found with ID: " + contractId);
        }
    }

}

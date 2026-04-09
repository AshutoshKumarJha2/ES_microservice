package com.cts.eventsphere.vendormanager.service;

import com.cts.eventsphere.vendormanager.dto.contract.ContractRequestDto;
import com.cts.eventsphere.vendormanager.dto.contract.ContractResponseDto;
import com.cts.eventsphere.vendormanager.dto.delivery.DeliveryRequestDto;
import com.cts.eventsphere.vendormanager.dto.delivery.DeliveryResponseDto;
import com.cts.eventsphere.vendormanager.dto.invoice.InvoiceRequestDto;
import com.cts.eventsphere.vendormanager.dto.invoice.InvoiceResponseDto;
import com.cts.eventsphere.vendormanager.model.data.ContractStatus;

import java.util.List;

/**
 * Service interface for Contract Operations.
 * Orchestrates the lifecycle of vendor agreements and coordinates with
 * billing and logistics modules.
 *
 * @author 2480177
 * @version 1.0
 * @since 03-03-2026
 */

public interface ContractService {
    /**
     * Creates a new contract and associates it with a vendor and event.
     * @param request the contract details from the organizer
     * @return the created contract response
     */
    ContractResponseDto createContract(String actorId, ContractRequestDto request);

    /**
     * Records a new deliverable item against an active contract.
     * * @param contractId the unique identifier of the contract
     * @param deliveryDto the delivery details to be added
     */
    DeliveryResponseDto addDeliverable(String actorId, String contractId, DeliveryRequestDto deliveryDto);

    /**
     * Initiates the invoice creation process for a specific contract.
     * * @param contractId the unique identifier of the contract
     * @param invoiceDto the billing details for the new invoice
     * @return the generated invoice response DTO
     */
    InvoiceResponseDto createInvoice(String actorId, String contractId, InvoiceRequestDto invoiceDto);

    /**
     * Retrieves a contract by its ID.
     * * @param contractId the unique identifier
     * @return the contract details response DTO
     */
    ContractResponseDto getContractById(String actorId, String contractId);

    /**
     * Retrieves all contracts in the system.
     * @return list of contract response DTOs
     */
    List<ContractResponseDto> getAllContracts(String actorId);

    /**
     * Updates the status of an existing contract.
     * @param contractId the unique identifier
     * @param status the new contract status
     * @return the updated contract response
     */
    ContractResponseDto updateContractStatus(String actorId, String contractId, ContractStatus status);

    /**
     * Updates the details of a contract.
     * @param contractId the unique identifier
     * @param request the new details
     * @return the updated contract response
     */
    ContractResponseDto updateContract(String actorId, String contractId, ContractRequestDto request);

    /**
     * Removes a contract record from the system.
     * @param contractId the unique identifier to delete
     */
    void deleteContract(String actorId, String contractId);
}

package com.cts.eventsphere.vendormanager.service.impl;


import com.cts.eventsphere.vendormanager.dto.mapper.vendor.VendorRequestDtoMapper;
import com.cts.eventsphere.vendormanager.dto.mapper.vendor.VendorResponseDtoMapper;
import com.cts.eventsphere.vendormanager.dto.vendor.VendorRequestDto;
import com.cts.eventsphere.vendormanager.dto.vendor.VendorResponseDto;
import com.cts.eventsphere.vendormanager.exception.vendor.VendorAlreadyExistsException;
import com.cts.eventsphere.vendormanager.exception.vendor.VendorInUseException;
import com.cts.eventsphere.vendormanager.exception.vendor.VendorNotFoundException;
import com.cts.eventsphere.vendormanager.model.Vendor;
import com.cts.eventsphere.vendormanager.repository.VendorRepository;
import com.cts.eventsphere.vendormanager.service.VendorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Implementation for Vendor Service.
 * Manages the registration and profile lifecycle of service providers.
 *
 * @author 2480177
 * @version 1.0
 * @since 03-03-2026
 */

@Service
@RequiredArgsConstructor
@Slf4j
public class VendorServiceImpl implements VendorService {

    private final VendorRepository vendorRepository;
    private final VendorRequestDtoMapper requestDtoMapper;
    private final VendorResponseDtoMapper responseDtoMapper;
//    private final AuditService auditService;
//    private final NotificationService notificationService;

    /**
     * Registers a new vendor in the system.
     *
     * @param request the vendor details to be saved
     * @return the saved vendor as a response DTO
     */
    @Override
    @Transactional
    public VendorResponseDto createVendor(String actorId, VendorRequestDto request){
        log.info("Creating vendor by actorId={}", actorId);
        if (vendorRepository.count() > 0) {
            throw new VendorAlreadyExistsException("A vendor is already registered. Only one vendor company is allowed.");
        }
        Vendor vendor = requestDtoMapper.toEntity(request);
        Vendor saved = vendorRepository.save(vendor);

        log.info("Vendor created with ID={}, by actorId={}", saved.getVendorId(),actorId);
//        auditService.logAudit(actorId, AuditAction.CREATE, Vendor.class, saved.getVendorId());
//        notificationService.sendNotification(
//                actorId,
//                "Welcome! Vendor registered successfully.",
//                "VENDOR_REGISTERED"
//        );
        return responseDtoMapper.toDto(saved);
    }

    /**
     * Retrieves vendor details based on the provided ID.
     *
     * @param vendorId the unique identifier of the vendor
     * @return the vendor details
     * @throws VendorNotFoundException if no vendor exists with the given ID
     */
    @Override
    @Transactional(readOnly = true)
    public VendorResponseDto getVendorById(String actorId, String vendorId){
        log.info("Fetching vendor details for Id={}, by actorId={}", vendorId,actorId);

        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new VendorNotFoundException("Vendor not found with ID: " +vendorId));

//        auditService.logAudit(actorId, AuditAction.READ, Vendor.class, vendorId);
        log.info("Fetched vendor details for Id: {} by actorId= {}", vendorId, actorId);
        return responseDtoMapper.toDto(vendor);
    }

    /**
     * Fetches all registered vendors from the database.
     *
     * @return a list of all vendor response DTOs
     */
    @Override
    @Transactional(readOnly = true)
    public List<VendorResponseDto> getAllVendors(String actorId){
        log.info("Fetching all vendor details from database by actorId={}",actorId);
        return vendorRepository.findAll()
                .stream()
//                .peek(v ->
//                        auditService.logAudit(
//                                actorId,
//                                AuditAction.READ,
//                                Vendor.class,
//                                v.getVendorId()
//                        )
//                )
                .map(responseDtoMapper::toDto)
                .toList();
    }

    /**
     * Updates an existing vendor's profile information.
     *
     * @param vendorId the ID of the vendor to update
     * @param request the new details to apply
     * @return the updated vendor details
     * @throws VendorNotFoundException if the vendor ID is invalid
     */
    @Override
    @Transactional
    public VendorResponseDto updateVendor(String actorId, String vendorId, VendorRequestDto request){
        log.info("Updating vendor details for ID={} by actorId={}", vendorId, actorId);

        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new VendorNotFoundException("Cannot update. Vendor not found with ID: "+vendorId));

        vendor.setName(request.name());
        vendor.setContactInfo(request.contactInfo());
        vendor.setStatus(request.status());

        Vendor updated = vendorRepository.save(vendor);
        log.info("Vendor ID={} updated successfully by actorId={}", vendorId, actorId);
//        auditService.logAudit(actorId, AuditAction.UPDATE, Vendor.class, vendorId);
//
//        notificationService.sendNotification(
//                actorId,
//                "Vendor profile updated successfully.",
//                "VENDOR_UPDATED"
//        );
        return responseDtoMapper.toDto(updated);
    }

    /**
     * Removes a vendor record from the system.
     *
     * @param vendorId the ID of the vendor to delete
     * @throws VendorNotFoundException if the vendor ID does not exist
     */
    @Override
    @Transactional
    public void deleteVendor(String actorId, String vendorId) {
        log.info("Attempting to delete vendor with ID={} by actorId={}", vendorId, actorId);

        // 1. Check existence first
        if (!vendorRepository.existsById(vendorId)) {
            throw new VendorNotFoundException("Vendor not found with ID: " + vendorId);
        }

        try {
            // 2. Attempt deletion
            vendorRepository.deleteById(vendorId);

            vendorRepository.flush();

            log.info("Vendor ID={} deleted successfully by actorId={}", vendorId, actorId);

            // auditService.logAudit(actorId, AuditAction.DELETE, Vendor.class, vendorId);
            // ... notification logic

        } catch (DataIntegrityViolationException e) {
            log.warn("Failed to delete vendor ID={} due to existing dependencies: {}", vendorId, e.getMessage());

            // 3. Throw your custom exception to be caught by the GlobalExceptionHandler
            throw new VendorInUseException("Vendor cannot be deleted because it is still linked to active contracts.");
        }
    }
}

package com.cts.eventsphere.vendormanager.dto.mapper.vendor;

import com.cts.eventsphere.vendormanager.dto.vendor.VendorResponseDto;
import com.cts.eventsphere.vendormanager.model.Vendor;
import org.springframework.stereotype.Component;

/**
 * Mapper for converting Vendor entity to VendorResponseDto
 *
 * @author 2480177
 * @version 1.0
 * @since 02-03-2026
 */

@Component
public class VendorResponseDtoMapper{
    public VendorResponseDto toDto(Vendor vendor){
        if (vendor == null) {
            return null;
        }
        return new VendorResponseDto(
                vendor.getVendorId(),
                vendor.getName(),
                vendor.getContactInfo(),
                vendor.getStatus(),
                vendor.getCreatedAt(),
                vendor.getUpdatedAt()
        );
    }
}

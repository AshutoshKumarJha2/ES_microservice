package com.cts.eventsphere.vendormanager.dto.mapper.vendor;


import com.cts.eventsphere.vendormanager.dto.vendor.VendorRequestDto;
import com.cts.eventsphere.vendormanager.model.Vendor;
import org.springframework.stereotype.Component;

/**
 * Mapper for converting VendorRequestDto to Vendor entity
 *
 * @author 2480177
 * @version 1.0
 * @since 02-03-2026
 */

@Component
public class VendorRequestDtoMapper{
    public Vendor toEntity(VendorRequestDto dto){
        if (dto == null) {
            return null;
        }
        Vendor vendor = new Vendor();
        vendor.setName(dto.name());
        vendor.setContactInfo(dto.contactInfo());
        vendor.setStatus(dto.status());
        return vendor;
    }
}

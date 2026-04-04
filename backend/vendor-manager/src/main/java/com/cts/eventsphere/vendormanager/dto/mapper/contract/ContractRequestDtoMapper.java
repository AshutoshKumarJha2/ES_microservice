package com.cts.eventsphere.vendormanager.dto.mapper.contract;

import com.cts.eventsphere.vendormanager.dto.contract.ContractRequestDto;
import com.cts.eventsphere.vendormanager.model.Contract;
import org.springframework.stereotype.Component;

/**
 * Mapper to convert ContractRequestDto to Contract Entity.
 *
 * @author 2480177
 * @version 1.0
 * @since 02-03-2026
 */

@Component
public class ContractRequestDtoMapper {

    public Contract toEntity(ContractRequestDto dto){
        if (dto == null) {
            return null;
        }
        Contract contract = new Contract();
        contract.setVendorId(dto.vendorId());
        contract.setEventId(dto.eventId());
        contract.setStartDate(dto.startDate());
        contract.setEndDate(dto.endDate());
        contract.setValue(dto.value());
        contract.setStatus(dto.status());
        return contract;
    }
}

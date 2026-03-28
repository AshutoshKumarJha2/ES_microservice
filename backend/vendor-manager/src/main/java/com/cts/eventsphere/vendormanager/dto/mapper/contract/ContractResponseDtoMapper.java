package com.cts.eventsphere.vendormanager.dto.mapper.contract;

import com.cts.eventsphere.vendormanager.dto.contract.ContractResponseDto;
import com.cts.eventsphere.vendormanager.model.Contract;
import org.springframework.stereotype.Component;

/**
 * Mapper to convert Contract Entity to ContractResponseDto.
 *
 * @author 2480177
 * @version 1.0
 * @since 02-03-2026
 */

@Component
public class ContractResponseDtoMapper {

    public ContractResponseDto toDto(Contract contract){
        if (contract == null) {
            return null;
        }
        return new ContractResponseDto(
                contract.getContractId(),
                contract.getVendorId(),
                contract.getEventId(),
                contract.getStartDate(),
                contract.getEndDate(),
                contract.getValue(),
                contract.getStatus(),
                contract.getCreatedAt(),
                contract.getUpdatedAt()
        );
    }
}

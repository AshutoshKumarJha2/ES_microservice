package com.cts.eventsphere.vendormanager.dto.mapper;

import com.cts.eventsphere.vendormanager.dto.contract.ContractRequestDto;
import com.cts.eventsphere.vendormanager.dto.contract.ContractResponseDto;
import com.cts.eventsphere.vendormanager.dto.mapper.contract.ContractRequestDtoMapper;
import com.cts.eventsphere.vendormanager.dto.mapper.contract.ContractResponseDtoMapper;
import com.cts.eventsphere.vendormanager.model.Contract;
import com.cts.eventsphere.vendormanager.model.data.ContractStatus;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class ContractMapperTest {

    private final ContractRequestDtoMapper requestMapper = new ContractRequestDtoMapper();
    private final ContractResponseDtoMapper responseMapper = new ContractResponseDtoMapper();

    @Test
    void requestMapper_toEntity_mapsAllFields() {
        LocalDateTime start = LocalDateTime.now();
        LocalDateTime end = start.plusDays(30);
        ContractRequestDto dto = new ContractRequestDto("v-1", "e-1", start, end, BigDecimal.valueOf(5000), ContractStatus.ACTIVE);

        Contract result = requestMapper.toEntity(dto);

        assertThat(result.getVendorId()).isEqualTo("v-1");
        assertThat(result.getEventId()).isEqualTo("e-1");
        assertThat(result.getStartDate()).isEqualTo(start);
        assertThat(result.getEndDate()).isEqualTo(end);
        assertThat(result.getValue()).isEqualByComparingTo(BigDecimal.valueOf(5000));
        assertThat(result.getStatus()).isEqualTo(ContractStatus.ACTIVE);
    }

    @Test
    void requestMapper_toEntity_nullInput_returnsNull() {
        assertThat(requestMapper.toEntity(null)).isNull();
    }

    @Test
    void responseMapper_toDto_mapsAllFields() {
        LocalDateTime now = LocalDateTime.now();
        Contract contract = new Contract();
        contract.setContractId("c-99");
        contract.setVendorId("v-1");
        contract.setEventId("e-1");
        contract.setStartDate(now);
        contract.setEndDate(now.plusDays(30));
        contract.setValue(BigDecimal.valueOf(7500));
        contract.setStatus(ContractStatus.COMPLETED);
        contract.setCreatedAt(now);
        contract.setUpdatedAt(now);

        ContractResponseDto result = responseMapper.toDto(contract);

        assertThat(result.contractId()).isEqualTo("c-99");
        assertThat(result.vendorId()).isEqualTo("v-1");
        assertThat(result.eventId()).isEqualTo("e-1");
        assertThat(result.startDate()).isEqualTo(now);
        assertThat(result.endDate()).isEqualTo(now.plusDays(30));
        assertThat(result.value()).isEqualByComparingTo(BigDecimal.valueOf(7500));
        assertThat(result.status()).isEqualTo(ContractStatus.COMPLETED);
        assertThat(result.createdAt()).isEqualTo(now);
        assertThat(result.updatedAt()).isEqualTo(now);
    }

    @Test
    void responseMapper_toDto_nullInput_returnsNull() {
        assertThat(responseMapper.toDto(null)).isNull();
    }
}

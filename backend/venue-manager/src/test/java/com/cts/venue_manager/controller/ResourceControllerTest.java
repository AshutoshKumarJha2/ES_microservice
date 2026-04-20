package com.cts.venue_manager.controller;

import com.cts.venue_manager.auth.dto.UserPrincipal;
import com.cts.venue_manager.dto.resource.ResourceAllocationRequestDto;
import com.cts.venue_manager.dto.resource.ResourceListElementDto;
import com.cts.venue_manager.dto.resource.ResourceRequestDto;
import com.cts.venue_manager.dto.resource.ResourceResponseDto;
import com.cts.venue_manager.dto.shared.MessageResponseDto;
import com.cts.venue_manager.model.data.Availability;
import com.cts.venue_manager.model.data.ResourceType;
import com.cts.venue_manager.service.ResourceService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ResourceControllerTest {

    @Mock
    private ResourceService resourceService;

    @InjectMocks
    private ResourceController resourceController;

    private final UserPrincipal user = new UserPrincipal("user-1", "VENUE_MANAGER", List.of());

    private ResourceResponseDto buildResourceResponse(String id) {
        return new ResourceResponseDto(id, "v-1", ResourceType.EQUIPMENT,
                "Projector", Availability.AVAILABLE, 5, BigDecimal.valueOf(200));
    }

    @Test
    void createResource_returns201() {
        ResourceRequestDto request = new ResourceRequestDto("Projector", ResourceType.EQUIPMENT, BigDecimal.valueOf(200), 5);
        ResourceResponseDto expected = buildResourceResponse("r-1");
        when(resourceService.createResource("user-1", "v-1", request)).thenReturn(expected);

        ResponseEntity<ResourceResponseDto> response = resourceController.createResource("v-1", request, user);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isEqualTo(expected);
    }

    @Test
    void getAllResources_returns200() {
        when(resourceService.getAllResources("user-1")).thenReturn(List.of(buildResourceResponse("r-1")));

        ResponseEntity<List<ResourceResponseDto>> response = resourceController.getAllResources(user);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).hasSize(1);
    }

    @Test
    void getResourceById_returns200() {
        ResourceResponseDto expected = buildResourceResponse("r-1");
        when(resourceService.getResourceById("user-1", "r-1")).thenReturn(expected);

        ResponseEntity<ResourceResponseDto> response = resourceController.getResourceById("r-1", user);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(expected);
    }

    @Test
    void getResourcesByVenue_returns200() {
        when(resourceService.getResourcesByVenue("user-1", "v-1")).thenReturn(List.of(buildResourceResponse("r-1")));

        ResponseEntity<List<ResourceResponseDto>> response = resourceController.getResourcesByVenue("v-1", user);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).hasSize(1);
    }

    @Test
    void requestAllocation_returns201WithMessage() {
        List<ResourceListElementDto> elements = List.of();
        ResourceAllocationRequestDto request = new ResourceAllocationRequestDto("event-1", "v-1", "b-1", elements);
        doNothing().when(resourceService).requestAllocation("user-1", "b-1", "event-1", "v-1", elements);

        ResponseEntity<MessageResponseDto> response = resourceController.requestAllocation(request, user);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody().message()).isEqualTo("Resource Requested");
    }

    @Test
    void approveAllocation_returns200() {
        doNothing().when(resourceService).approveAllocation("user-1", "alloc-1");

        ResponseEntity<MessageResponseDto> response = resourceController.approveAllocation("alloc-1", user);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(resourceService).approveAllocation("user-1", "alloc-1");
    }

    @Test
    void updateResource_returns200() {
        ResourceRequestDto request = new ResourceRequestDto("Microphone", ResourceType.EQUIPMENT, BigDecimal.valueOf(100), 10);
        ResourceResponseDto expected = buildResourceResponse("r-1");
        when(resourceService.updateResource("user-1", "r-1", request)).thenReturn(expected);

        ResponseEntity<ResourceResponseDto> response = resourceController.updateResource("r-1", request, user);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    void deleteResource_returns204() {
        doNothing().when(resourceService).deleteResource("user-1", "r-1");

        ResponseEntity<Void> response = resourceController.deleteResource("r-1", user);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        verify(resourceService).deleteResource("user-1", "r-1");
    }
}

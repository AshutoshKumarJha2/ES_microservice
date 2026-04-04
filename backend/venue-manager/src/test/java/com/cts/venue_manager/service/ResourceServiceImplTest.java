package com.cts.venue_manager.service;

import com.cts.venue_manager.client.microservice.EventClient;
import com.cts.venue_manager.client.model.data.EventStatus;
import com.cts.venue_manager.dto.event.EventResponseDto;
import com.cts.venue_manager.dto.resource.ResourceListElementDto;
import com.cts.venue_manager.dto.resource.ResourceRequestDto;
import com.cts.venue_manager.dto.resource.ResourceResponseDto;
import com.cts.venue_manager.exception.resource.InsufficientResourceException;
import com.cts.venue_manager.exception.resource.ResourceAlreadyExistsException;
import com.cts.venue_manager.exception.resource.ResourceDuplicateAllocationException;
import com.cts.venue_manager.exception.resource.ResourceNotFoundException;
import com.cts.venue_manager.exception.venue.VenueNotFoundException;
import com.cts.venue_manager.model.Resource;
import com.cts.venue_manager.model.ResourceAllocation;
import com.cts.venue_manager.model.Venue;
import com.cts.venue_manager.model.data.Availability;
import com.cts.venue_manager.model.data.AvailabilityStatus;
import com.cts.venue_manager.model.data.ResourceType;
import com.cts.venue_manager.repository.ResourceAllocationRepository;
import com.cts.venue_manager.repository.ResourceRepository;
import com.cts.venue_manager.repository.VenueRepository;
import com.cts.venue_manager.service.impl.ResourceServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ResourceServiceImplTest {

    @Mock private ResourceRepository resourceRepository;
    @Mock private EventClient eventClient;
    @Mock private VenueRepository venueRepository;
    @Mock private ResourceAllocationRepository resourceAllocationRepository;

    @InjectMocks
    private ResourceServiceImpl resourceService;

    private static final String ACTOR_ID = "actor-1";
    private static final String VENUE_ID = "venue-100";
    private static final String RESOURCE_ID = "resource-200";
    private static final String EVENT_ID = "event-300";
    private static final String ALLOCATION_ID = "alloc-400";

    private Venue buildVenue(String id) {
        Venue venue = new Venue();
        venue.setVenueId(id);
        venue.setName("Test Venue");
        venue.setLocation("NYC");
        venue.setCapacity(200);
        venue.setAvailabilityStatus(AvailabilityStatus.AVAILABLE);
        return venue;
    }

    private Resource buildResource(String id, int units) {
        Resource r = new Resource();
        r.setResourceId(id);
        r.setName("Projector");
        r.setType(ResourceType.EQUIPMENT);
        r.setAvailability(Availability.AVAILABLE);
        r.setCostRate(BigDecimal.valueOf(100));
        r.setUnit(units);
        r.setVenue(buildVenue(VENUE_ID));
        return r;
    }

    private ResourceResponseDto buildResourceResponse(String id) {
        return new ResourceResponseDto(id, VENUE_ID, ResourceType.EQUIPMENT, "Projector",
                Availability.AVAILABLE, 10, BigDecimal.valueOf(100));
    }

    // ─── createResource ───────────────────────────────────────────────────────

    @Test
    void createResource_success() {
        ResourceRequestDto request = new ResourceRequestDto("Projector", ResourceType.EQUIPMENT,
                BigDecimal.valueOf(100), 10);

        when(resourceRepository.existsByName("Projector")).thenReturn(false);
        Venue venue = buildVenue(VENUE_ID);
        when(venueRepository.findById(VENUE_ID)).thenReturn(Optional.of(venue));

        Resource saved = buildResource(RESOURCE_ID, 10);
        when(resourceRepository.save(any(Resource.class))).thenReturn(saved);

        ResourceResponseDto result = resourceService.createResource(ACTOR_ID, VENUE_ID, request);

        assertThat(result.resourceId()).isEqualTo(RESOURCE_ID);
        assertThat(result.name()).isEqualTo("Projector");
        verify(resourceRepository).save(any(Resource.class));
    }

    @Test
    void createResource_nameAlreadyExists_throwsResourceAlreadyExistsException() {
        ResourceRequestDto request = new ResourceRequestDto("Projector", ResourceType.EQUIPMENT,
                BigDecimal.valueOf(100), 10);

        when(resourceRepository.existsByName("Projector")).thenReturn(true);

        assertThatThrownBy(() -> resourceService.createResource(ACTOR_ID, VENUE_ID, request))
                .isInstanceOf(ResourceAlreadyExistsException.class);
        verify(resourceRepository, never()).save(any());
    }

    @Test
    void createResource_venueNotFound_throwsVenueNotFoundException() {
        ResourceRequestDto request = new ResourceRequestDto("Projector", ResourceType.EQUIPMENT,
                BigDecimal.valueOf(100), 10);

        when(resourceRepository.existsByName("Projector")).thenReturn(false);
        when(venueRepository.findById(VENUE_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> resourceService.createResource(ACTOR_ID, VENUE_ID, request))
                .isInstanceOf(VenueNotFoundException.class);
        verify(resourceRepository, never()).save(any());
    }

    // ─── getAllResources ──────────────────────────────────────────────────────

    @Test
    void getAllResources_returnsList() {
        Resource r1 = buildResource("r1", 5);
        Resource r2 = buildResource("r2", 10);

        when(resourceRepository.findAll()).thenReturn(List.of(r1, r2));

        List<ResourceResponseDto> result = resourceService.getAllResources(ACTOR_ID);

        assertThat(result).hasSize(2);
    }

    @Test
    void getAllResources_empty_returnsEmptyList() {
        when(resourceRepository.findAll()).thenReturn(List.of());

        assertThat(resourceService.getAllResources(ACTOR_ID)).isEmpty();
    }

    // ─── approveAllocation ───────────────────────────────────────────────────

    @Test
    void approveAllocation_success() {
        Resource resource = buildResource(RESOURCE_ID, 10);
        ResourceAllocation allocation = ResourceAllocation.builder()
                .allocationId(ALLOCATION_ID)
                .resource(resource)
                .eventId(EVENT_ID)
                .quantity(3)
                .build();

        when(resourceAllocationRepository.findById(ALLOCATION_ID)).thenReturn(Optional.of(allocation));
        when(resourceRepository.save(any(Resource.class))).thenReturn(resource);

        resourceService.approveAllocation(ACTOR_ID, ALLOCATION_ID);

        assertThat(resource.getUnit()).isEqualTo(7);
        verify(resourceRepository).save(resource);
    }

    @Test
    void approveAllocation_insufficientUnits_throwsInsufficientResourceException() {
        Resource resource = buildResource(RESOURCE_ID, 2);
        ResourceAllocation allocation = ResourceAllocation.builder()
                .allocationId(ALLOCATION_ID)
                .resource(resource)
                .eventId(EVENT_ID)
                .quantity(5)
                .build();

        when(resourceAllocationRepository.findById(ALLOCATION_ID)).thenReturn(Optional.of(allocation));

        assertThatThrownBy(() -> resourceService.approveAllocation(ACTOR_ID, ALLOCATION_ID))
                .isInstanceOf(InsufficientResourceException.class);
        verify(resourceRepository, never()).save(any());
    }

    @Test
    void approveAllocation_notFound_throwsResourceNotFoundException() {
        when(resourceAllocationRepository.findById(ALLOCATION_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> resourceService.approveAllocation(ACTOR_ID, ALLOCATION_ID))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ─── getResourceById ─────────────────────────────────────────────────────

    @Test
    void getResourceById_found() {
        Resource resource = buildResource(RESOURCE_ID, 10);
        when(resourceRepository.findById(RESOURCE_ID)).thenReturn(Optional.of(resource));

        ResourceResponseDto result = resourceService.getResourceById(ACTOR_ID, RESOURCE_ID);

        assertThat(result.resourceId()).isEqualTo(RESOURCE_ID);
    }

    @Test
    void getResourceById_notFound_throwsResourceNotFoundException() {
        when(resourceRepository.findById(RESOURCE_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> resourceService.getResourceById(ACTOR_ID, RESOURCE_ID))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ─── updateResource ───────────────────────────────────────────────────────

    @Test
    void updateResource_success() {
        ResourceRequestDto dto = new ResourceRequestDto("Updated Projector", ResourceType.EQUIPMENT,
                BigDecimal.valueOf(150), 20);
        Resource existing = buildResource(RESOURCE_ID, 10);
        Resource saved = buildResource(RESOURCE_ID, 20);
        saved.setName("Updated Projector");

        when(resourceRepository.findById(RESOURCE_ID)).thenReturn(Optional.of(existing));
        when(resourceRepository.save(existing)).thenReturn(saved);

        ResourceResponseDto result = resourceService.updateResource(ACTOR_ID, RESOURCE_ID, dto);

        assertThat(result.name()).isEqualTo("Updated Projector");
        assertThat(existing.getName()).isEqualTo("Updated Projector");
        assertThat(existing.getUnit()).isEqualTo(20);
        verify(resourceRepository).save(existing);
    }

    @Test
    void updateResource_notFound_throwsResourceNotFoundException() {
        ResourceRequestDto dto = new ResourceRequestDto("X", ResourceType.EQUIPMENT, BigDecimal.ONE, 1);
        when(resourceRepository.findById(RESOURCE_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> resourceService.updateResource(ACTOR_ID, RESOURCE_ID, dto))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ─── deleteResource ───────────────────────────────────────────────────────

    @Test
    void deleteResource_success() {
        Resource resource = buildResource(RESOURCE_ID, 5);
        when(resourceRepository.findById(RESOURCE_ID)).thenReturn(Optional.of(resource));
        doNothing().when(resourceRepository).deleteById(RESOURCE_ID);

        resourceService.deleteResource(ACTOR_ID, RESOURCE_ID);

        verify(resourceRepository).deleteById(RESOURCE_ID);
    }

    @Test
    void deleteResource_notFound_throwsResourceNotFoundException() {
        when(resourceRepository.findById(RESOURCE_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> resourceService.deleteResource(ACTOR_ID, RESOURCE_ID))
                .isInstanceOf(ResourceNotFoundException.class);
        verify(resourceRepository, never()).deleteById(any());
    }

    // ─── requestAllocation ────────────────────────────────────────────────────

    @Test
    void requestAllocation_success() {
        EventResponseDto eventDto = EventResponseDto.builder()
                .id(EVENT_ID).eventName("Gala Night").organizerId("org-1")
                .startAt("2026-06-01").endAt("2026-06-02").venueId(VENUE_ID)
                .status(EventStatus.PUBLISHED)
                .build();

        when(eventClient.getById(EVENT_ID)).thenReturn(ResponseEntity.ok(eventDto));
        Venue venue = buildVenue(VENUE_ID);
        when(venueRepository.findById(VENUE_ID)).thenReturn(Optional.of(venue));

        Resource resource = buildResource(RESOURCE_ID, 10);
        when(resourceRepository.findById(RESOURCE_ID)).thenReturn(Optional.of(resource));
        when(resourceAllocationRepository.existsByResourceNameAndEventId("Projector", EVENT_ID)).thenReturn(false);
        when(resourceAllocationRepository.save(any(ResourceAllocation.class))).thenAnswer(inv -> inv.getArgument(0));

        List<ResourceListElementDto> resources = List.of(new ResourceListElementDto(RESOURCE_ID, 2));

        resourceService.requestAllocation(ACTOR_ID, "booking-1", EVENT_ID, VENUE_ID, resources);

        verify(resourceAllocationRepository).save(any(ResourceAllocation.class));
    }

    @Test
    void requestAllocation_duplicateAllocation_throwsResourceDuplicateAllocationException() {
        EventResponseDto eventDto = EventResponseDto.builder()
                .id(EVENT_ID).eventName("Gala Night").organizerId("org-1")
                .startAt("2026-06-01").endAt("2026-06-02").venueId(VENUE_ID)
                .status(EventStatus.PUBLISHED)
                .build();

        when(eventClient.getById(EVENT_ID)).thenReturn(ResponseEntity.ok(eventDto));
        Venue venue = buildVenue(VENUE_ID);
        when(venueRepository.findById(VENUE_ID)).thenReturn(Optional.of(venue));

        Resource resource = buildResource(RESOURCE_ID, 10);
        when(resourceRepository.findById(RESOURCE_ID)).thenReturn(Optional.of(resource));
        when(resourceAllocationRepository.existsByResourceNameAndEventId("Projector", EVENT_ID)).thenReturn(true);

        List<ResourceListElementDto> resources = List.of(new ResourceListElementDto(RESOURCE_ID, 2));

        assertThatThrownBy(() -> resourceService.requestAllocation(ACTOR_ID, "booking-1", EVENT_ID, VENUE_ID, resources))
                .isInstanceOf(ResourceDuplicateAllocationException.class);
        verify(resourceAllocationRepository, never()).save(any());
    }

    @Test
    void requestAllocation_venueNotFound_throwsResourceNotFoundException() {
        EventResponseDto eventDto = EventResponseDto.builder()
                .id(EVENT_ID).eventName("Gala Night").organizerId("org-1")
                .startAt("2026-06-01").endAt("2026-06-02").venueId(VENUE_ID)
                .status(EventStatus.PUBLISHED)
                .build();

        when(eventClient.getById(EVENT_ID)).thenReturn(ResponseEntity.ok(eventDto));
        when(venueRepository.findById(VENUE_ID)).thenReturn(Optional.empty());

        List<ResourceListElementDto> resources = List.of(new ResourceListElementDto(RESOURCE_ID, 2));

        assertThatThrownBy(() -> resourceService.requestAllocation(ACTOR_ID, "booking-1", EVENT_ID, VENUE_ID, resources))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void requestAllocation_resourceNotFound_throwsResourceNotFoundException() {
        EventResponseDto eventDto = EventResponseDto.builder()
                .id(EVENT_ID).eventName("Gala Night").organizerId("org-1")
                .startAt("2026-06-01").endAt("2026-06-02").venueId(VENUE_ID)
                .status(EventStatus.PUBLISHED)
                .build();

        when(eventClient.getById(EVENT_ID)).thenReturn(ResponseEntity.ok(eventDto));
        Venue venue = buildVenue(VENUE_ID);
        when(venueRepository.findById(VENUE_ID)).thenReturn(Optional.of(venue));
        when(resourceRepository.findById(RESOURCE_ID)).thenReturn(Optional.empty());

        List<ResourceListElementDto> resources = List.of(new ResourceListElementDto(RESOURCE_ID, 2));

        assertThatThrownBy(() -> resourceService.requestAllocation(ACTOR_ID, "booking-1", EVENT_ID, VENUE_ID, resources))
                .isInstanceOf(com.cts.venue_manager.exception.resource.ResourceNotFoundException.class);
        verify(resourceAllocationRepository, never()).save(any());
    }

    // ─── getResourcesByVenue ──────────────────────────────────────────────────

    @Test
    void getResourcesByVenue_returnsList() {
        Resource r1 = buildResource("r1", 5);
        Resource r2 = buildResource("r2", 8);

        when(resourceRepository.findByVenue_VenueId(VENUE_ID)).thenReturn(List.of(r1, r2));

        List<ResourceResponseDto> result = resourceService.getResourcesByVenue(ACTOR_ID, VENUE_ID);

        assertThat(result).hasSize(2);
    }

    @Test
    void getResourcesByVenue_noMatch_returnsEmpty() {
        when(resourceRepository.findByVenue_VenueId(VENUE_ID)).thenReturn(List.of());

        assertThat(resourceService.getResourcesByVenue(ACTOR_ID, VENUE_ID)).isEmpty();
    }
}

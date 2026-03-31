package com.cts.venue_manager.controller;

import com.cts.venue_manager.auth.dto.UserPrincipal;
import com.cts.venue_manager.dto.venue.VenueRequestDto;
import com.cts.venue_manager.dto.venue.VenueResponseDto;
import com.cts.venue_manager.model.data.AvailabilityStatus;
import com.cts.venue_manager.service.VenueService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VenueControllerTest {

    @Mock
    private VenueService venueService;

    @InjectMocks
    private VenueController venueController;

    private final UserPrincipal user = new UserPrincipal("user-1", "VENUE_MANAGER", List.of());

    private VenueResponseDto buildVenueResponse(String id) {
        return new VenueResponseDto(id, "Grand Hall", "New York", 500, AvailabilityStatus.available);
    }

    @Test
    void addVenue_returns201() {
        VenueRequestDto request = new VenueRequestDto("Grand Hall", "New York", 500, AvailabilityStatus.available);
        VenueResponseDto expected = buildVenueResponse("v-1");
        when(venueService.create("user-1", request)).thenReturn(expected);

        ResponseEntity<VenueResponseDto> response = venueController.addVenue(request, user);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isEqualTo(expected);
    }

    @Test
    void getAllVenue_returns200WithList() {
        when(venueService.findAll("user-1")).thenReturn(List.of(buildVenueResponse("v-1")));

        ResponseEntity<List<VenueResponseDto>> response = venueController.getAllVenue(user);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).hasSize(1);
    }

    @Test
    void updateVenue_returns200() {
        VenueRequestDto request = new VenueRequestDto("Updated Hall", "Chicago", 600, AvailabilityStatus.available);
        VenueResponseDto expected = buildVenueResponse("v-1");
        when(venueService.updateVenue("user-1", "v-1", request)).thenReturn(expected);

        ResponseEntity<VenueResponseDto> response = venueController.updateVenue("v-1", request, user);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(expected);
    }

    @Test
    void updateVenueStatus_returns200() {
        VenueResponseDto expected = buildVenueResponse("v-1");
        when(venueService.updateVenueStatus("user-1", "v-1", AvailabilityStatus.unavailable)).thenReturn(expected);

        ResponseEntity<VenueResponseDto> response = venueController.updateVenueStatus("v-1", AvailabilityStatus.unavailable, user);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    void deleteVenue_returns204() {
        doNothing().when(venueService).deleteVenue("user-1", "v-1");

        ResponseEntity<Void> response = venueController.deleteVenue("v-1", user);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        verify(venueService).deleteVenue("user-1", "v-1");
    }

    @Test
    void getVenueByLocation_returns200() {
        when(venueService.findByLocation("user-1", "Chicago")).thenReturn(List.of(buildVenueResponse("v-2")));

        ResponseEntity<List<VenueResponseDto>> response = venueController.getVenueByLocation("Chicago", user);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).hasSize(1);
    }

    @Test
    void getVenueByCapacity_returns200() {
        when(venueService.findByCapacity("user-1", 300)).thenReturn(List.of(buildVenueResponse("v-1")));

        ResponseEntity<List<VenueResponseDto>> response = venueController.getVenueByCapacity(300, user);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).hasSize(1);
    }

    @Test
    void getVenueByStatus_returns200() {
        when(venueService.findByAvailabilityStatus("user-1", AvailabilityStatus.available))
                .thenReturn(List.of(buildVenueResponse("v-1")));

        ResponseEntity<List<VenueResponseDto>> response = venueController.getVenueByStatus(AvailabilityStatus.available, user);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).hasSize(1);
    }

    @Test
    void getVenueByDate_returns200() {
        when(venueService.findByDate("user-1", "2026-06-15")).thenReturn(List.of(buildVenueResponse("v-1")));

        ResponseEntity<List<VenueResponseDto>> response = venueController.getVenueByDate("2026-06-15", user);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }
}

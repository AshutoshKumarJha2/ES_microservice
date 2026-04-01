package com.cts.venue_manager.exception;

import com.cts.venue_manager.exception.booking.BookingNotFoundException;
import com.cts.venue_manager.exception.resource.InsufficientResourceException;
import com.cts.venue_manager.exception.resource.ResourceAlreadyExistsException;
import com.cts.venue_manager.exception.resource.ResourceDuplicateAllocationException;
import com.cts.venue_manager.exception.resource.ResourceNotFoundException;
import com.cts.venue_manager.exception.venue.VenueNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(MockitoExtension.class)
class GlobalExceptionHandlerTest {

    @InjectMocks
    private GlobalExceptionHandler handler;

    @Test
    void handleVenueNotFound_returns404() {
        VenueNotFoundException ex = new VenueNotFoundException("Venue not found: v-1");

        ResponseEntity<String> response = handler.handleVenueNotFoundException(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody()).isEqualTo("Venue not found: v-1");
    }

    @Test
    void handleResourceNotFound_returns404() {
        ResourceNotFoundException ex = new ResourceNotFoundException("Resource not found: r-1");

        ResponseEntity<String> response = handler.handleResourceNotFound(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody()).isEqualTo("Resource not found: r-1");
    }

    @Test
    void handleInsufficientResource_returns400() {
        InsufficientResourceException ex = new InsufficientResourceException("Only 2 units available");

        ResponseEntity<String> response = handler.handleInsufficientResource(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isEqualTo("Only 2 units available");
    }

    @Test
    void handleResourceAlreadyExists_returns409() {
        ResourceAlreadyExistsException ex = new ResourceAlreadyExistsException("Resource already exists: Projector");

        ResponseEntity<String> response = handler.handleResourceAlreadyExists(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(response.getBody()).isEqualTo("Resource already exists: Projector");
    }

    @Test
    void handleResourceDuplicateAllocation_returns409() {
        ResourceDuplicateAllocationException ex = new ResourceDuplicateAllocationException("Already allocated for this event");

        ResponseEntity<String> response = handler.handleResourceDuplicateAllocation(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(response.getBody()).isEqualTo("Already allocated for this event");
    }

    @Test
    void handleBookingNotFound_returns404() {
        BookingNotFoundException ex = new BookingNotFoundException("Booking not found: b-1");

        ResponseEntity<String> response = handler.handleBookingNotFound(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody()).isEqualTo("Booking not found: b-1");
    }
}

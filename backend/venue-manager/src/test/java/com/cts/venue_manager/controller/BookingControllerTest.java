package com.cts.venue_manager.controller;

import com.cts.venue_manager.auth.dto.UserPrincipal;
import com.cts.venue_manager.dto.booking.BookingRequestDto;
import com.cts.venue_manager.dto.booking.BookingResponseDto;
import com.cts.venue_manager.dto.booking.BookingResponseVenueManagerDto;
import com.cts.venue_manager.model.data.BookingStatus;
import com.cts.venue_manager.service.BookingService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingControllerTest {

    @Mock
    private BookingService bookingService;

    @InjectMocks
    private BookingController bookingController;

    private final UserPrincipal user = new UserPrincipal("user-1", "ORGANIZER", List.of());

    private BookingResponseDto buildBookingResponse(String id) {
        return new BookingResponseDto(id, "event-1", "v-1",
                LocalDate.now(), BookingStatus.confirmed, List.of(),
                LocalDateTime.now(), LocalDateTime.now());
    }

    @Test
    void createBooking_returns201() {
        BookingRequestDto request = new BookingRequestDto("event-1", "v-1");
        BookingResponseDto expected = buildBookingResponse("b-1");
        when(bookingService.createBooking("user-1", request)).thenReturn(expected);

        ResponseEntity<BookingResponseDto> response = bookingController.createBooking(request, user);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isEqualTo(expected);
    }

    @Test
    void getAllBookings_returns200WithList() {
        when(bookingService.getAllBookingsServ("user-1")).thenReturn(List.of(buildBookingResponse("b-1")));

        ResponseEntity<List<BookingResponseDto>> response = bookingController.getAllBookings(user);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).hasSize(1);
    }

    @Test
    void getBookingsByVenue_returns200() {
        BookingResponseVenueManagerDto dto = new BookingResponseVenueManagerDto(
                "b-1", "event-1", "v-1", LocalDate.now(), BookingStatus.pending, List.of(),
                LocalDateTime.now(), LocalDateTime.now());
        when(bookingService.getBookingsByVenue("user-1", "v-1")).thenReturn(List.of(dto));

        ResponseEntity<List<BookingResponseVenueManagerDto>> response = bookingController.getBookingsByVenue("v-1", user);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).hasSize(1);
    }

    @Test
    void getBookingsByEvent_returns200() {
        when(bookingService.getBookingsByEvent("user-1", "event-1")).thenReturn(List.of(buildBookingResponse("b-1")));

        ResponseEntity<List<BookingResponseDto>> response = bookingController.getBookingsByEvent("event-1", user);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).hasSize(1);
    }

    @Test
    void updateStatus_returns200() {
        BookingResponseDto expected = buildBookingResponse("b-1");
        when(bookingService.updateBookingStatus("user-1", "b-1", BookingStatus.confirmed)).thenReturn(expected);

        ResponseEntity<BookingResponseDto> response = bookingController.updateStatus("b-1", BookingStatus.confirmed, user);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    void deleteBooking_returns204() {
        doNothing().when(bookingService).deleteBooking("user-1", "b-1");

        ResponseEntity<Void> response = bookingController.deleteBooking("b-1", user);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        verify(bookingService).deleteBooking("user-1", "b-1");
    }
}

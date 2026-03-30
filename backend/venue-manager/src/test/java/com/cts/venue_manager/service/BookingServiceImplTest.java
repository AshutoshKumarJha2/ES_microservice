package com.cts.venue_manager.service;

import com.cts.venue_manager.dto.booking.BookingRequestDto;
import com.cts.venue_manager.dto.booking.BookingResponseDto;
import com.cts.venue_manager.dto.booking.BookingResponseVenueManagerDto;
import com.cts.venue_manager.dto.mapper.booking.BookingRepsonseVenueManagerDtoMapper;
import com.cts.venue_manager.dto.mapper.booking.BookingRequestDtoMapper;
import com.cts.venue_manager.dto.mapper.booking.BookingResponseDtoMapper;
import com.cts.venue_manager.exception.booking.BookingNotFoundException;
import com.cts.venue_manager.model.Booking;
import com.cts.venue_manager.model.Venue;
import com.cts.venue_manager.model.data.AvailabilityStatus;
import com.cts.venue_manager.model.data.BookingStatus;
import com.cts.venue_manager.repository.BookingRepository;
import com.cts.venue_manager.repository.VenueRepository;
import com.cts.venue_manager.service.impl.BookingServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingServiceImplTest {

    @Mock private BookingRepository bookingRepository;
    @Mock private VenueRepository venueRepository;
    @Mock private BookingRequestDtoMapper requestMapper;
    @Mock private BookingResponseDtoMapper responseMapper;
    @Mock private BookingRepsonseVenueManagerDtoMapper venueManagerMapper;

    @InjectMocks
    private BookingServiceImpl bookingService;

    private static final String ACTOR_ID = "actor-1";
    private static final String BOOKING_ID = "booking-100";
    private static final String VENUE_ID = "venue-200";
    private static final String EVENT_ID = "event-300";

    private Venue buildVenue(String id) {
        Venue venue = new Venue();
        venue.setVenueId(id);
        venue.setName("Grand Hall");
        venue.setLocation("New York");
        venue.setCapacity(500);
        venue.setAvailabilityStatus(AvailabilityStatus.available);
        return venue;
    }

    private Booking buildBooking(String id, BookingStatus status) {
        Booking booking = new Booking();
        booking.setBookingId(id);
        booking.setEventId(EVENT_ID);
        booking.setVenue(buildVenue(VENUE_ID));
        booking.setDate(LocalDate.now().plusDays(10));
        booking.setStatus(status);
        booking.setCreatedAt(LocalDateTime.now());
        booking.setUpdatedAt(LocalDateTime.now());
        return booking;
    }

    private BookingResponseDto buildResponseDto(String id) {
        return new BookingResponseDto(id, EVENT_ID, VENUE_ID, LocalDate.now(), BookingStatus.pending,
                new ArrayList<>(), LocalDateTime.now(), LocalDateTime.now());
    }

    // ─── createBooking ────────────────────────────────────────────────────────

    @Test
    void createBooking_success() {
        BookingRequestDto request = new BookingRequestDto(EVENT_ID, VENUE_ID);
        Booking booking = buildBooking(null, BookingStatus.pending);
        booking.setVenue(null);
        Venue venue = buildVenue(VENUE_ID);
        Booking saved = buildBooking(BOOKING_ID, BookingStatus.pending);
        BookingResponseDto expected = buildResponseDto(BOOKING_ID);

        when(requestMapper.toEntity(request)).thenReturn(booking);
        when(venueRepository.findById(VENUE_ID)).thenReturn(Optional.of(venue));
        when(bookingRepository.save(booking)).thenReturn(saved);
        when(responseMapper.toDto(saved, new ArrayList<>())).thenReturn(expected);

        BookingResponseDto result = bookingService.createBooking(ACTOR_ID, request);

        assertThat(result.bookingId()).isEqualTo(BOOKING_ID);
        assertThat(result.status()).isEqualTo(BookingStatus.pending);
    }

    @Test
    void createBooking_nullDate_defaultsToToday() {
        BookingRequestDto request = new BookingRequestDto(EVENT_ID, VENUE_ID);
        Booking booking = buildBooking(null, BookingStatus.pending);
        booking.setVenue(null);
        booking.setDate(null); // triggers the null-date fallback branch
        Venue venue = buildVenue(VENUE_ID);
        Booking saved = buildBooking(BOOKING_ID, BookingStatus.pending);
        BookingResponseDto expected = buildResponseDto(BOOKING_ID);

        when(requestMapper.toEntity(request)).thenReturn(booking);
        when(venueRepository.findById(VENUE_ID)).thenReturn(Optional.of(venue));
        when(bookingRepository.save(booking)).thenReturn(saved);
        when(responseMapper.toDto(saved, new ArrayList<>())).thenReturn(expected);

        BookingResponseDto result = bookingService.createBooking(ACTOR_ID, request);

        assertThat(result.bookingId()).isEqualTo(BOOKING_ID);
        assertThat(booking.getDate()).isNotNull();
    }

    @Test
    void createBooking_venueNotFound_throwsRuntimeException() {
        BookingRequestDto request = new BookingRequestDto(EVENT_ID, VENUE_ID);
        Booking booking = buildBooking(null, BookingStatus.pending);
        booking.setVenue(null);

        when(requestMapper.toEntity(request)).thenReturn(booking);
        when(venueRepository.findById(VENUE_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> bookingService.createBooking(ACTOR_ID, request))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Venue not found");
    }

    // ─── updateBookingStatus ──────────────────────────────────────────────────

    @Test
    void updateBookingStatus_success() {
        Booking booking = buildBooking(BOOKING_ID, BookingStatus.pending);
        Booking saved = buildBooking(BOOKING_ID, BookingStatus.confirmed);
        BookingResponseDto expected = new BookingResponseDto(BOOKING_ID, EVENT_ID, VENUE_ID,
                LocalDate.now(), BookingStatus.confirmed, new ArrayList<>(), LocalDateTime.now(), LocalDateTime.now());

        when(bookingRepository.findById(BOOKING_ID)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(booking)).thenReturn(saved);
        when(responseMapper.toDto(saved, new ArrayList<>())).thenReturn(expected);

        BookingResponseDto result = bookingService.updateBookingStatus(ACTOR_ID, BOOKING_ID, BookingStatus.confirmed);

        assertThat(result.status()).isEqualTo(BookingStatus.confirmed);
    }

    @Test
    void updateBookingStatus_notFound_throwsBookingNotFoundException() {
        when(bookingRepository.findById(BOOKING_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> bookingService.updateBookingStatus(ACTOR_ID, BOOKING_ID, BookingStatus.confirmed))
                .isInstanceOf(BookingNotFoundException.class);
    }

    // ─── deleteBooking ────────────────────────────────────────────────────────

    @Test
    void deleteBooking_success() {
        when(bookingRepository.existsById(BOOKING_ID)).thenReturn(true);
        doNothing().when(bookingRepository).deleteById(BOOKING_ID);

        bookingService.deleteBooking(ACTOR_ID, BOOKING_ID);

        verify(bookingRepository).deleteById(BOOKING_ID);
    }

    @Test
    void deleteBooking_notFound_throwsBookingNotFoundException() {
        when(bookingRepository.existsById(BOOKING_ID)).thenReturn(false);

        assertThatThrownBy(() -> bookingService.deleteBooking(ACTOR_ID, BOOKING_ID))
                .isInstanceOf(BookingNotFoundException.class);
        verify(bookingRepository, never()).deleteById(any());
    }

    // ─── getAllBookingsServ ────────────────────────────────────────────────────

    @Test
    void getAllBookingsServ_returnsList() {
        Booking b1 = buildBooking("b1", BookingStatus.pending);
        Booking b2 = buildBooking("b2", BookingStatus.confirmed);
        BookingResponseDto dto1 = buildResponseDto("b1");
        BookingResponseDto dto2 = buildResponseDto("b2");

        when(bookingRepository.findAll()).thenReturn(List.of(b1, b2));
        when(responseMapper.toDto(eq(b1), any())).thenReturn(dto1);
        when(responseMapper.toDto(eq(b2), any())).thenReturn(dto2);

        List<BookingResponseDto> result = bookingService.getAllBookingsServ(ACTOR_ID);

        assertThat(result).hasSize(2);
    }

    @Test
    void getAllBookingsServ_empty_returnsEmptyList() {
        when(bookingRepository.findAll()).thenReturn(List.of());

        assertThat(bookingService.getAllBookingsServ(ACTOR_ID)).isEmpty();
    }

    // ─── getBookingsByVenue ───────────────────────────────────────────────────

    @Test
    void getBookingsByVenue_returnsList() {
        Booking b1 = buildBooking("b1", BookingStatus.confirmed);
        BookingResponseVenueManagerDto dto1 = mock(BookingResponseVenueManagerDto.class);

        when(bookingRepository.findByVenue_VenueId(VENUE_ID)).thenReturn(List.of(b1));
        when(venueManagerMapper.toDto(eq(b1), any())).thenReturn(dto1);

        List<BookingResponseVenueManagerDto> result = bookingService.getBookingsByVenue(ACTOR_ID, VENUE_ID);

        assertThat(result).hasSize(1);
    }

    @Test
    void getBookingsByVenue_noMatch_returnsEmpty() {
        when(bookingRepository.findByVenue_VenueId(VENUE_ID)).thenReturn(List.of());

        assertThat(bookingService.getBookingsByVenue(ACTOR_ID, VENUE_ID)).isEmpty();
    }

    // ─── getBookingsByEvent ───────────────────────────────────────────────────

    @Test
    void getBookingsByEvent_returnsList() {
        Booking b1 = buildBooking("b1", BookingStatus.pending);
        BookingResponseDto dto1 = buildResponseDto("b1");

        when(bookingRepository.findByEventId(EVENT_ID)).thenReturn(List.of(b1));
        when(responseMapper.toDto(eq(b1), any())).thenReturn(dto1);

        List<BookingResponseDto> result = bookingService.getBookingsByEvent(ACTOR_ID, EVENT_ID);

        assertThat(result).hasSize(1);
    }

    @Test
    void getBookingsByEvent_noMatch_returnsEmpty() {
        when(bookingRepository.findByEventId(EVENT_ID)).thenReturn(List.of());

        assertThat(bookingService.getBookingsByEvent(ACTOR_ID, EVENT_ID)).isEmpty();
    }
}

package com.cts.venue_manager.dto.mapper;

import com.cts.venue_manager.dto.booking.BookingRequestDto;
import com.cts.venue_manager.dto.booking.BookingResponseDto;
import com.cts.venue_manager.dto.booking.BookingResponseVenueManagerDto;
import com.cts.venue_manager.dto.mapper.booking.BookingRepsonseVenueManagerDtoMapper;
import com.cts.venue_manager.dto.mapper.booking.BookingRequestDtoMapper;
import com.cts.venue_manager.dto.mapper.booking.BookingResponseDtoMapper;
import com.cts.venue_manager.dto.resource.ResourceListElementDto;
import com.cts.venue_manager.dto.resource.ResourceVenueManagerResponseDto;
import com.cts.venue_manager.model.Booking;
import com.cts.venue_manager.model.Venue;
import com.cts.venue_manager.model.data.AvailabilityStatus;
import com.cts.venue_manager.model.data.BookingStatus;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class BookingMapperTest {

    private final BookingRequestDtoMapper requestMapper = new BookingRequestDtoMapper();
    private final BookingResponseDtoMapper responseMapper = new BookingResponseDtoMapper();
    private final BookingRepsonseVenueManagerDtoMapper venueManagerMapper = new BookingRepsonseVenueManagerDtoMapper();

    private Booking buildBooking(String bookingId, String eventId, String venueId) {
        Venue venue = new Venue();
        venue.setVenueId(venueId);
        venue.setName("Test Venue");
        venue.setLocation("City");
        venue.setCapacity(100);
        venue.setAvailabilityStatus(AvailabilityStatus.available);

        Booking booking = new Booking();
        booking.setBookingId(bookingId);
        booking.setEventId(eventId);
        booking.setVenue(venue);
        booking.setDate(LocalDate.of(2026, 6, 15));
        booking.setStatus(BookingStatus.confirmed);
        return booking;
    }

    @Test
    void requestMapper_toEntity_setsEventId() {
        BookingRequestDto dto = new BookingRequestDto("event-1", "venue-1");

        Booking result = requestMapper.toEntity(dto);

        assertThat(result.getEventId()).isEqualTo("event-1");
        assertThat(result.getVenue()).isNull();
    }

    @Test
    void responseMapper_toDto_mapsAllFields() {
        LocalDateTime now = LocalDateTime.now();
        Booking booking = buildBooking("b-1", "event-1", "v-1");
        booking.setCreatedAt(now);
        booking.setUpdatedAt(now);
        List<ResourceListElementDto> resources = List.of();

        BookingResponseDto result = responseMapper.toDto(booking, resources);

        assertThat(result.bookingId()).isEqualTo("b-1");
        assertThat(result.eventId()).isEqualTo("event-1");
        assertThat(result.venueId()).isEqualTo("v-1");
        assertThat(result.date()).isEqualTo(LocalDate.of(2026, 6, 15));
        assertThat(result.status()).isEqualTo(BookingStatus.confirmed);
        assertThat(result.resourceList()).isEmpty();
        assertThat(result.createdAt()).isEqualTo(now);
        assertThat(result.updatedAt()).isEqualTo(now);
    }

    @Test
    void responseMapper_toDto_nullBooking_returnsNull() {
        assertThat(responseMapper.toDto(null, List.of())).isNull();
    }

    @Test
    void venueManagerMapper_toDto_mapsAllFields() {
        LocalDateTime now = LocalDateTime.now();
        Booking booking = buildBooking("b-2", "event-2", "v-2");
        booking.setCreatedAt(now);
        booking.setUpdatedAt(now);
        List<ResourceVenueManagerResponseDto> resources = List.of();

        BookingResponseVenueManagerDto result = venueManagerMapper.toDto(booking, resources);

        assertThat(result.bookingId()).isEqualTo("b-2");
        assertThat(result.eventId()).isEqualTo("event-2");
        assertThat(result.venueId()).isEqualTo("v-2");
        assertThat(result.status()).isEqualTo(BookingStatus.confirmed);
        assertThat(result.resourceList()).isEmpty();
    }

    @Test
    void venueManagerMapper_toDto_nullBooking_returnsNull() {
        assertThat(venueManagerMapper.toDto(null, List.of())).isNull();
    }
}

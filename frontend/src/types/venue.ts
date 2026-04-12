// ─── Enums ────────────────────────────────────────────────────────────────────

export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

export type ResourceType = "EQUIPMENT" | "STAFF";

export type Availability = "AVAILABLE" | "IN_USE" | "UNAVAILABLE";

export type AvailabilityStatus = "AVAILABLE" | "UNAVAILABLE" | "MAINTENENCE";

export type EventStatus = "DRAFT" | "PUBLISHED" | "COMPLETED" | "CANCELLED";

// ─── Venue DTOs ───────────────────────────────────────────────────────────────

export interface VenueRequestDto {
  name: string;
  location: string;
  capacity: number;
  availabilityStatus?: AvailabilityStatus;
}

export interface VenueResponseDto {
  id: string;
  name: string;
  location: string;
  capacity: number;
  availabilityStatus: AvailabilityStatus;
}

// ─── Resource DTOs ────────────────────────────────────────────────────────────

export interface ResourceRequestDto {
  name: string;
  type: ResourceType;
  costRate: number;
  unit: number;
}

export interface ResourceResponseDto {
  resourceId: string;
  venueId: string;
  type: ResourceType;
  name: string;
  availability: Availability;
  unit: number;
  costRate: number;
}

export interface ResourceListElementDto {
  resourceId: string;
  quantity: number;
}

export interface ResourceAllocationRequestDto {
  eventId: string;
  venueId: string;
  bookingId: string;
  resourceListElement: ResourceListElementDto[];
}

export interface ResourceVenueManagerResponseDto {
  resourceName: string;
  requestedQuantity: number;
}

// ─── Booking DTOs ─────────────────────────────────────────────────────────────

export interface BookingRequestDto {
  eventId: string;
  venueId: string;
}

export interface BookingResponseDto {
  bookingId: string;
  eventId: string;
  venueId: string;
  date: string;
  status: BookingStatus;
  resourceList: ResourceListElementDto[];
  createdAt: string;
  updatedAt: string;
}

export interface BookingResponseVenueManagerDto {
  bookingId: string;
  eventId: string;
  venueId: string;
  date: string;
  status: BookingStatus;
  resourceList: ResourceVenueManagerResponseDto[];
  createdAt: string;
  updatedAt: string;
}

// ─── Event DTOs ───────────────────────────────────────────────────────────────

export interface EventRequestDto {
  name: string;
  organizerId: string;
  startDate: string;
  endDate: string;
  venueId?: string;
  status?: EventStatus;
}

export interface EventResponseDto {
  id: string;
  eventName: string;
  organizerId: string;
  startAt: string;
  endAt: string;
  status: EventStatus;
  venueId: string;
}

// ─── Shared DTOs ──────────────────────────────────────────────────────────────

export interface MessageResponseDto {
  message: string;
}

// ─── Auth DTOs ────────────────────────────────────────────────────────────────

export interface ServiceTokenRequest {
  serviceName: string;
  serviceSecret: string;
}

export interface ServiceTokenResponse {
  token: string;
  tokenType: string;
  expiresInSeconds: number;
}
// ── Notifications ─────────────────────────────────────────────────────────────

export interface AppNotification {
  notificationId: string
  userId: string
  eventId?: string
  message: string
  category: string
  status: string   // 'READ' | 'UNREAD'
  createdAt: string
  updatedAt?: string
}

export interface SendNotificationDto {
  userId: string
  message: string
  category: string
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface UserRequestDto {
  name: string
  email: string
  phone: string
  password?: string
}

export interface UserResponseDto {
  userId: string
  name: string
  email: string
  phone: string
  role: 'ADMIN' | 'ORGANIZER' | 'VENUE_MANAGER' | 'FINANCE_OFFICER' | 'ATTENDEE' | 'VENDOR'
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
}

// ── Venue ─────────────────────────────────────────────────────────────────────

export interface VenueResponseDto {
  id: string
  name: string
  location: string
  capacity: number
  availabilityStatus: 'available' | 'unavailable' | 'maintenence'
}

// ── Events ────────────────────────────────────────────────────────────────────

export type EventStatus = 'draft' | 'published' | 'completed' | 'cancelled'

export interface EventRequestDto {
  name: string
  organizerId: string
  startDate: string
  endDate: string
  venueId?: string
  status?: EventStatus
}

export interface EventResponseDto {
  id: string
  eventName: string
  organizerId: string
  startAt: string
  endAt: string
  status: EventStatus
  venueId: string
}

// ── Schedules ─────────────────────────────────────────────────────────────────

export type ScheduleStatus = 'draft' | 'active' | 'completed' | 'terminated'

export interface ScheduleRequestDto {
  eventId: string
  date: string
  timeSlot: string
  activity: string
  status: ScheduleStatus
}

export interface ScheduleResponseDto {
  scheduleId: string
  eventId: string
  date: string
  timeSlot: string
  activity: string
  status: ScheduleStatus
}

// ── Tickets ───────────────────────────────────────────────────────────────────

export interface CreateTicketRequest {
  type: string
  price: number
  status: 'ACTIVE' | 'INACTIVE'
}

export interface TicketResponseDto {
  ticketId: string
  eventId: string
  type: string
  price: number
  status: 'ACTIVE' | 'INACTIVE'
}

export interface TicketListResponseDto {
  tickets: TicketResponseDto[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

// ── Registrations ─────────────────────────────────────────────────────────────

export interface RegistrationRequestDto {
  ticketId: string
}

export interface RegistrationDto {
  registrationId: string
  eventId: string
  ticketId: string
  attendeeId: string
  status: string
}

export interface RegistrationListResponseDto {
  registrations: RegistrationDto[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

// ── Budget & Expenses ─────────────────────────────────────────────────────────

export interface BudgetRequestDto {
  plannedAmount: number
}

export interface BudgetResponseDto {
  budgetId: string
  eventId: string
  plannedAmount: number
  actualAmount: number
  variance: number
}

export interface ExpenseRequestDto {
  description: string
  amount: number
  date: string
}

export interface ExpenseResponseDto {
  expenseId: string
  eventId: string
  description: string
  amount: number
  date: string
  approvedBy?: string
  status?: string
}

export interface PageExpenseResponseDto {
  content: ExpenseResponseDto[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

// ── Analytics ─────────────────────────────────────────────────────────────────

export interface EngagementResponseDto {
  engagementId?: string
  eventId: string
  userId?: string
  activity: string
  createdAt?: string
}

export interface FeedbackResponseDto {
  feedbackId?: string
  eventId: string
  userId?: string
  rating?: number
  comment?: string
  createdAt?: string
}

export interface PageFeedbackResponseDto {
  content: FeedbackResponseDto[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

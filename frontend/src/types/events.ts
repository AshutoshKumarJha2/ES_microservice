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
  availabilityStatus: 'AVAILABLE' | 'UNAVAILABLE' | 'MAINTENENCE'
}

// ── Events ────────────────────────────────────────────────────────────────────

export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'COMPLETED' | 'CANCELLED'

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
  venue?: VenueResponseDto
}

// ── Schedules ─────────────────────────────────────────────────────────────────

export type ScheduleStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'TERMINATED'

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

export interface UserDetailsDto {
  userId: string
  name: string
  email: string
  phone: string
  role: string
  status: string
}

export interface RegistrationDto {
  registrationId: string
  eventId: string
  ticketId: string
  ticketType: string | null
  ticketPrice: number | null
  attendeeId: string
  status: string
  attendeeDetails: UserDetailsDto | null
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

export type EngagementActivity =
  | 'REGISTRATION' | 'REGISTRATION_CONFIRMATION' | 'CHECK_IN' | 'SESSION_BOOKMARK'
  | 'SESSION_JOIN' | 'SESSION_LEAVE' | 'SESSION_QA_SUBMIT' | 'SESSION_FEEDBACK_SUBMIT'
  | 'POLL_VIEW' | 'POLL_VOTE' | 'SURVEY_SUBMIT'
  | 'CHAT_MESSAGE' | 'DIRECT_MESSAGE'
  | 'BOOTH_VISIT' | 'RESOURCE_DOWNLOAD' | 'CTA_BUTTON_CLICK'
  | 'EVENT_FEEDBACK_SUBMIT' | 'CERTIFICATE_DOWNLOAD' | 'RECORDING_PLAY'

export interface EngagementRequestDto {
  eventId: string
  attendeeId: string
  activity: EngagementActivity
  activityTimestamp: string   // LocalDateTime — "YYYY-MM-DDTHH:mm:ss"
}

export interface EngagementResponseDto {
  engagementId?: string
  eventId: string
  attendeeId?: string
  activity: string
  activityTimestamp?: string
}

export interface FeedbackResponseDto {
  feedbackId?: string
  eventId: string
  attendeeId?: string
  rating?: number
  comments?: string
  createdAt?: string
}

export interface PageFeedbackResponseDto {
  content: FeedbackResponseDto[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export interface FeedbackRequestDto {
  eventId: string
  attendeeId: string
  rating: number
  comments: string
  createdAt: string
}

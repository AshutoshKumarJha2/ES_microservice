# EventSphere Microservices Migration Guide

## Core Rule: No Cross-Service JPA Relations

In a monolith, entities reference each other via `@ManyToOne`, `@OneToMany`, etc.
In microservices, **each service has its own database**. You cannot have a JPA join across services.

**Replace every cross-service `@ManyToOne` / `@OneToMany` with a plain `String` ID field.**

---

## Service 1 — User & Auth Service

### Models to Own
- `User`
- `AuditLog`

### Changes to Models

**User** — no cross-service relations, keep as-is. Remove:
```java
// REMOVE these — they reference entities owned by other services
@OneToMany(mappedBy = "approvedBy")
private List<Expense> expenses;          // Expense is in Finance Service

@OneToMany(mappedBy = "attendee")
private List<Registration> registrations; // Registration is in Event Service

@OneToMany(mappedBy = "user")
private List<AuditLog> auditLogs;        // Keep — AuditLog is in this service
```

**AuditLog** — replace User relation with plain ID:
```java
// BEFORE
@ManyToOne
@JoinColumn(name = "userId", nullable = false)
private User user;

// AFTER
@Column(name = "userId", nullable = false, length = 36)
private String userId;
```

### DTOs

```java
// Request
public record UserRequestDto(
    String name,
    String email,
    String password,
    String phone
) {}

// Response
public record UserResponseDto(
    String userId,
    String name,
    String role,
    String email,
    String phone,
    String status
) {}

// AuditLog Response
public record AuditLogResponseDto(
    String auditId,
    String userId,
    String action,
    String resource,
    String entityId,
    String entityName,
    LocalDateTime timestamp
) {}
```

### Feign Client (for other services to call)

```java
@FeignClient(name = "user-service", url = "${services.user.url}")
public interface UserServiceClient {

    @GetMapping("/api/v1/users/{userId}")
    UserResponseDto getUserById(@PathVariable String userId);

    @GetMapping("/api/v1/users/{userId}/exists")
    boolean userExists(@PathVariable String userId);

    @PostMapping("/api/v1/audit")
    void logAudit(@RequestBody AuditLogRequestDto request);
}
```

---

## Service 2 — Event & Scheduling Service

### Models to Own
- `Event`
- `Schedule`
- `Ticket`
- `Registration`

### Changes to Models

**Event** — remove all `@OneToMany` to other services:
```java
// REMOVE these — they reference entities in other services
@OneToMany(mappedBy = "event", cascade = CascadeType.ALL)
private List<Expense> expenses;   // Expense is in Finance Service

@OneToMany(mappedBy = "event", cascade = CascadeType.ALL)
private List<Contract> contracts; // Contract is in Vendor Service

// venueId and organizerId are already stored as plain Strings — keep them
private String organizerId;  // references User in User Service — keep as String
private String venueId;      // references Venue in Venue Service — keep as String
```

**Schedule** — replace Event relation with plain ID:
```java
// BEFORE
@ManyToOne
@JoinColumn(name = "eventId", nullable = false)
private Event event;

// AFTER
@Column(name = "eventId", nullable = false, length = 36)
private String eventId;
```

**Registration** — replace all relations with plain IDs:
```java
// BEFORE
@ManyToOne
@JoinColumn(name = "eventId")
private Event event;

@ManyToOne
@JoinColumn(name = "ticketId")
private Ticket ticket;

@ManyToOne
@JoinColumn(name = "attendeeId", nullable = false)
private User attendee;

// AFTER
@Column(name = "eventId", length = 36)
private String eventId;

@Column(name = "ticketId", length = 36)
private String ticketId;

@Column(name = "attendeeId", nullable = false, length = 36)
private String attendeeId;
```

**Ticket** — already stores `eventId` as plain String, no changes needed.

### DTOs

```java
// Event Request
public record EventRequestDto(
    String name,
    String organizerId,
    LocalDateTime startDate,
    LocalDateTime endDate,
    String venueId,
    EventStatus status
) {}

// Event Response
public record EventResponseDto(
    String eventId,
    String name,
    String organizerId,
    LocalDateTime startDate,
    LocalDateTime endDate,
    String venueId,
    EventStatus status
) {}

// Schedule Request
public record ScheduleRequestDto(
    String eventId,
    LocalDate date,
    String timeSlot,
    String activity,
    ScheduleStatus status
) {}

// Ticket Request
public record TicketRequestDto(
    String eventId,
    String type,
    BigDecimal price,
    TicketStatus status
) {}

// Registration Request
public record RegistrationRequestDto(
    String eventId,
    String ticketId,
    String attendeeId,
    LocalDate date
) {}

// Registration Response
public record RegistrationResponseDto(
    String registrationId,
    String eventId,
    String ticketId,
    String attendeeId,
    LocalDate date,
    RegistrationStatus status
) {}
```

### Feign Client (for other services to call)

```java
@FeignClient(name = "event-service", url = "${services.event.url}")
public interface EventServiceClient {

    @GetMapping("/api/v1/events/{eventId}")
    EventResponseDto getEventById(@PathVariable String eventId);

    @GetMapping("/api/v1/events/{eventId}/exists")
    boolean eventExists(@PathVariable String eventId);

    @GetMapping("/api/v1/events/{eventId}/tickets/{ticketId}")
    TicketResponseDto getTicketById(
        @PathVariable String eventId,
        @PathVariable String ticketId
    );
}
```

### Feign Calls This Service Makes

```java
// Called after event is created
@FeignClient(name = "finance-service", url = "${services.finance.url}")
public interface FinanceServiceClient {

    @PostMapping("/api/events/v1/{eventId}/budget")
    BudgetResponseDto createBudget(
        @PathVariable String eventId,
        @RequestBody BudgetRequestDto request
    );
}
```

---

## Service 3 — Venue & Resource Service

### Models to Own
- `Venue`
- `Booking`
- `Resource`
- `ResourceAllocation`

### Changes to Models

**Venue** — remove `@OneToMany` to keep it clean; Resource and Booking are in same service so you can keep those relations:
```java
// These are WITHIN the same service — can keep JPA relations
@OneToMany(mappedBy = "venue", cascade = CascadeType.ALL, orphanRemoval = true)
private List<Resource> resources;

@OneToMany(mappedBy = "venue", cascade = CascadeType.ALL)
private List<Booking> bookings;
```

**Booking** — replace Event relation (cross-service) with plain ID; keep Venue relation (same service):
```java
// eventId is already a plain String — keep it
@Column(name = "eventId", length = 36, nullable = false)
private String eventId;

// KEEP — Venue is in the same service
@ManyToOne
@JoinColumn(name = "venueId", nullable = false)
private Venue venue;
```

**Resource** — keep Venue relation (same service):
```java
// KEEP — Venue is in the same service
@ManyToOne
@JoinColumn(name = "venueId", nullable = false)
private Venue venue;
```

**ResourceAllocation** — replace Event relation (cross-service) with plain ID; keep Resource and Venue (same service):
```java
// BEFORE
@ManyToOne
@JoinColumn(name = "eventId", nullable = false)
private Event event;   // Event is in Event Service — remove

// AFTER
@Column(name = "eventId", nullable = false, length = 36)
private String eventId;

// KEEP — Resource and Venue are in the same service
@ManyToOne
@JoinColumn(name = "resourceId", nullable = false)
private Resource resource;

@ManyToOne
@JoinColumn(name = "venueId", nullable = false)
private Venue venue;
```

### DTOs

```java
// Venue Request
public record VenueRequestDto(
    String name,
    String location,
    int capacity,
    AvailabilityStatus availabilityStatus
) {}

// Venue Response
public record VenueResponseDto(
    String venueId,
    String name,
    String location,
    int capacity,
    AvailabilityStatus availabilityStatus
) {}

// Booking Request
public record BookingRequestDto(
    String eventId,
    String venueId,
    LocalDate date
) {}

// Booking Response
public record BookingResponseDto(
    String bookingId,
    String eventId,
    String venueId,
    LocalDate date,
    BookingStatus status
) {}

// Resource Request
public record ResourceRequestDto(
    String venueId,
    String name,
    ResourceType type,
    BigDecimal costRate,
    Integer unit
) {}

// ResourceAllocation Request
public record ResourceAllocationRequestDto(
    String eventId,
    String resourceId,
    String venueId,
    Integer quantity
) {}
```

### Feign Client (for other services to call)

```java
@FeignClient(name = "venue-service", url = "${services.venue.url}")
public interface VenueServiceClient {

    @GetMapping("/api/v1/venues/{venueId}")
    VenueResponseDto getVenueById(@PathVariable String venueId);

    @GetMapping("/api/v1/venues/{venueId}/available")
    boolean isVenueAvailable(@PathVariable String venueId);
}
```

### Feign Calls This Service Makes

```java
@FeignClient(name = "finance-service", url = "${services.finance.url}")
public interface FinanceServiceClient {

    // Called when booking is confirmed
    @PostMapping("/api/v1/events/{eventId}/expenses")
    ExpenseResponseDto recordExpense(
        @PathVariable String eventId,
        @RequestBody ExpenseRequestDto request
    );
}
```

---

## Service 4 — Vendor & Contract Service

### Models to Own
- `Vendor`
- `Contract`
- `Delivery`

### Changes to Models

**Vendor** — remove `@OneToMany` to Contract (keep contracts within service):
```java
// KEEP — Contract is in the same service
@OneToMany(mappedBy = "vendor")
private List<Contract> contracts;
```

**Contract** — `vendorId` and `eventId` are already stored as plain Strings. Remove the redundant `@ManyToOne` with `insertable=false, updatable=false` and keep only the `@OneToMany` to Invoice (same service):
```java
// vendorId and eventId — already plain Strings, keep them
@Column(name = "vendorId", nullable = false, length = 36)
private String vendorId;

@Column(name = "eventId", nullable = false, length = 36)
private String eventId;

// REMOVE redundant ManyToOne with insertable=false (was for monolith only)
// @ManyToOne @JoinColumn(name="vendorId", insertable=false, updatable=false)
// private Vendor vendor;   <-- REMOVE

// KEEP — Invoice is in Finance Service — REMOVE this too
// @OneToMany(mappedBy = "contract", cascade = CascadeType.ALL)
// private List<Invoice> invoices;  <-- REMOVE, Invoice is in Finance Service
```

**Delivery** — replace Invoice relation (cross-service to Finance) with plain ID:
```java
// BEFORE
@ManyToOne
@JoinColumn(name = "invoiceId", insertable = false, updatable = false)
private Invoice invoice;  // Invoice is in Finance Service

// AFTER — invoiceId is already a plain String, just remove the @ManyToOne
@Column(name = "invoiceId", nullable = false, length = 36)
private String invoiceId;
```

### DTOs

```java
// Vendor Request
public record VendorRequestDto(
    String name,
    String contactInfo,
    VendorStatus status
) {}

// Vendor Response
public record VendorResponseDto(
    String vendorId,
    String name,
    String contactInfo,
    VendorStatus status
) {}

// Contract Request
public record ContractRequestDto(
    String vendorId,
    String eventId,
    LocalDateTime startDate,
    LocalDateTime endDate,
    BigDecimal value,
    ContractStatus status
) {}

// Contract Response
public record ContractResponseDto(
    String contractId,
    String vendorId,
    String eventId,
    LocalDateTime startDate,
    LocalDateTime endDate,
    BigDecimal value,
    ContractStatus status
) {}

// Delivery Request
public record DeliveryRequestDto(
    String invoiceId,
    String item,
    Integer quantity,
    LocalDateTime deliveryDate,
    String trackingNumber
) {}

// Delivery Response
public record DeliveryResponseDto(
    String deliveryId,
    String invoiceId,
    String item,
    Integer quantity,
    DeliveryStatus status,
    String trackingNumber,
    LocalDateTime deliveryDate
) {}
```

### Feign Client (for other services to call)

```java
@FeignClient(name = "vendor-service", url = "${services.vendor.url}")
public interface VendorServiceClient {

    @GetMapping("/api/v1/contracts/{contractId}")
    ContractResponseDto getContractById(@PathVariable String contractId);

    @GetMapping("/api/v1/vendors/{vendorId}")
    VendorResponseDto getVendorById(@PathVariable String vendorId);
}
```

### Feign Calls This Service Makes

```java
@FeignClient(name = "finance-service", url = "${services.finance.url}")
public interface FinanceServiceClient {

    // Called when contract is signed
    @PostMapping("/api/v1/invoices")
    InvoiceResponseDto createInvoice(@RequestBody InvoiceRequestDto request);

    // Called when delivery is confirmed
    @PostMapping("/api/v1/events/{eventId}/expenses")
    ExpenseResponseDto recordExpense(
        @PathVariable String eventId,
        @RequestBody ExpenseRequestDto request
    );
}
```

---

## Service 5 — Finance Service

### Models to Own
- `Budget`
- `Expense`
- `Invoice`
- `Payment`

### Changes to Models

**Budget** — replace Event relation (cross-service) with plain ID:
```java
// BEFORE
@OneToOne
@JoinColumn(name = "eventId", nullable = false, unique = true)
private Event event;

// AFTER
@Column(name = "eventId", nullable = false, unique = true, length = 36)
private String eventId;
```

**Expense** — replace Event and User relations (both cross-service) with plain IDs:
```java
// BEFORE
@ManyToOne
@JoinColumn(name = "eventId", nullable = false)
private Event event;

@ManyToOne
@JoinColumn(name = "approvedBy", nullable = true)
private User approvedBy;

// AFTER
@Column(name = "eventId", nullable = false, length = 36)
private String eventId;

@Column(name = "approvedBy", nullable = true, length = 36)
private String approvedBy;
```

**Invoice** — replace Contract relation (cross-service) with plain ID; keep Payment and Delivery (same service):
```java
// contractId is already a plain String — keep it
@Column(name = "contractId", nullable = false, length = 36)
private String contractId;

// REMOVE redundant @ManyToOne with insertable=false
// @ManyToOne @JoinColumn(name="contractId", insertable=false, updatable=false)
// private Contract contract;  <-- REMOVE

// KEEP — Payment is in the same service
@OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL)
private List<Payment> payments;

// Delivery is in Vendor Service — REMOVE
// @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL)
// private List<Delivery> deliveries;  <-- REMOVE
```

**Payment** — make `invoice` nullable and add an optional `expense` FK. The current monolith has `nullable = false` on `invoice`, but there are two distinct payment flows in the Finance Service:
- **Expense payment** — Finance Manager pays an approved `Expense` via `POST /expenses/{expenseId}/payment`. No invoice exists for venue bookings, resource allocations, or manually logged expenses.
- **Invoice payment** — Finance Manager marks an `Invoice` as PAID via `PUT /api/v1/invoices/{id}`. This is a status update on the invoice; a `Payment` record may optionally be created here.

Because `Payment` must support both flows, `invoice` must be nullable and `expense` must be added as a nullable FK. Exactly one of the two must be set — enforce this in the service layer.

```java
// BEFORE
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "invoiceId", nullable = false)
private Invoice invoice;

// AFTER — make invoice nullable
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "invoiceId", nullable = true)
private Invoice invoice;

// ADD — for expense payments (venue, resource, manual, vendor delivery)
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "expenseId", nullable = true)
private Expense expense;
```

Service-layer validation — enforce that exactly one is set:
```java
if (payment.getInvoice() == null && payment.getExpense() == null) {
    throw new IllegalArgumentException("Payment must be linked to either an invoice or an expense");
}
```

Budget `actualAmount` should only be updated when paying an **expense** (not on invoice status changes, since expenses already track the spend).

### DTOs

```java
// Budget Request
public record BudgetRequestDto(
    BigDecimal plannedAmount
) {}

// Budget Response
public record BudgetResponseDto(
    String budgetId,
    String eventId,
    BigDecimal plannedAmount,
    BigDecimal actualAmount,
    BigDecimal variance
) {}

// Expense Request
public record ExpenseRequestDto(
    String eventId,
    String description,
    BigDecimal amount,
    LocalDate date
) {}

// Expense Response
public record ExpenseResponseDto(
    String expenseId,
    String eventId,
    String description,
    BigDecimal amount,
    LocalDate date,
    ExpenseStatus status,
    String approvedBy
) {}

// Invoice Request
public record InvoiceRequestDto(
    String contractId,
    LocalDateTime dueDate,
    BigDecimal totalAmount
) {}

// Invoice Response
public record InvoiceResponseDto(
    String invoiceId,
    String contractId,
    LocalDateTime issueDate,
    LocalDateTime dueDate,
    BigDecimal totalAmount,
    InvoiceStatus status
) {}

// Payment Request
public record PaymentRequestDto(
    BigDecimal amount,
    PaymentMethod method,
    LocalDateTime paymentDate
) {}

// Payment Response
public record PaymentResponseDto(
    String paymentId,
    String invoiceId,   // null when paying an expense
    String expenseId,   // null when paying an invoice
    BigDecimal amount,
    PaymentMethod method,
    PaymentStatus status,
    LocalDateTime paymentDate
) {}
```

### Feign Client (for other services to call)

```java
@FeignClient(name = "finance-service", url = "${services.finance.url}")
public interface FinanceServiceClient {

    @PostMapping("/api/events/v1/{eventId}/budget")
    BudgetResponseDto createBudget(
        @PathVariable String eventId,
        @RequestBody BudgetRequestDto request
    );

    @PostMapping("/api/v1/events/{eventId}/expenses")
    ExpenseResponseDto recordExpense(
        @PathVariable String eventId,
        @RequestBody ExpenseRequestDto request
    );

    @PatchMapping("/api/v1/expenses/{expenseId}/status")
    ExpenseResponseDto updateExpenseStatus(
        @PathVariable String expenseId,
        @RequestParam ExpenseStatus status
    );

    @PostMapping("/api/v1/invoices")
    InvoiceResponseDto createInvoice(@RequestBody InvoiceRequestDto request);

    @PutMapping("/api/v1/invoices/{id}")
    InvoiceResponseDto updateInvoice(
        @PathVariable String id,
        @RequestBody InvoiceRequestDto request
    );
}
```

---

## Service 6 — Engagement & Feedback Service

### Models to Own
- `Engagement`
- `FeedBack`

### Changes to Models

**Engagement** — `eventId` and `attendeeId` are already plain Strings. Remove the redundant `@ManyToOne` relations:
```java
// REMOVE — these were insertable=false, updatable=false (monolith only)
// @ManyToOne @JoinColumn(name="eventId", insertable=false, updatable=false)
// private Event event;      <-- REMOVE

// @ManyToOne @JoinColumn(name="attendeeId", insertable=false, updatable=false)
// private User attendee;    <-- REMOVE

// KEEP plain String fields
@Column(name = "eventId", nullable = false, length = 36)
private String eventId;

@Column(name = "attendeeId", nullable = false, length = 36)
private String attendeeId;
```

**FeedBack** — same pattern as Engagement:
```java
// REMOVE redundant @ManyToOne relations
// @ManyToOne @JoinColumn(name="eventId", insertable=false, updatable=false)
// private Event event;     <-- REMOVE

// @ManyToOne @JoinColumn(name="attendeeId", insertable=false, updatable=false)
// private User attendee;   <-- REMOVE

// KEEP plain String fields
@Column(name = "eventId", nullable = false, length = 36)
private String eventId;

@Column(name = "attendeeId", nullable = false, length = 36)
private String attendeeId;
```

### DTOs

```java
// Engagement Request
public record EngagementRequestDto(
    String eventId,
    String attendeeId,
    EngagementType activity
) {}

// Engagement Response
public record EngagementResponseDto(
    String engagementId,
    String eventId,
    String attendeeId,
    EngagementType activity,
    LocalDateTime timestamp
) {}

// FeedBack Request
public record FeedBackRequestDto(
    String eventId,
    String attendeeId,
    int rating,
    String comments
) {}

// FeedBack Response
public record FeedBackResponseDto(
    String feedbackId,
    String eventId,
    String attendeeId,
    int rating,
    String comments,
    LocalDateTime date
) {}
```

### Feign Client (for other services to call)

```java
@FeignClient(name = "engagement-service", url = "${services.engagement.url}")
public interface EngagementServiceClient {

    @GetMapping("/api/v1/events/{eventId}/engagements")
    List<EngagementResponseDto> getEngagementsByEvent(@PathVariable String eventId);

    @GetMapping("/api/v1/events/{eventId}/feedbacks")
    List<FeedBackResponseDto> getFeedbackByEvent(@PathVariable String eventId);

    @GetMapping("/api/v1/events/{eventId}/rating")
    Double getAverageRating(@PathVariable String eventId);
}
```

---

## Service 7 — Notification Service

### Models to Own
- `Notification`

### Changes to Models

**Notification** — already stores `userId` and `eventId` as plain Strings. No JPA relations to remove.

### DTOs

```java
// Notification Request
public record NotificationRequestDto(
    String userId,
    String eventId,
    String message,
    String category
) {}

// Notification Response
public record NotificationResponseDto(
    String notificationId,
    String userId,
    String eventId,
    String message,
    String category,
    String status,
    LocalDateTime createdAt
) {}
```

### Feign Client (for other services to call)

```java
@FeignClient(name = "notification-service", url = "${services.notification.url}")
public interface NotificationServiceClient {

    @PostMapping("/api/v1/notifications")
    NotificationResponseDto sendNotification(@RequestBody NotificationRequestDto request);

    @GetMapping("/api/v1/users/{userId}/notifications")
    List<NotificationResponseDto> getNotificationsByUser(@PathVariable String userId);

    @PatchMapping("/api/v1/notifications/{notificationId}/read")
    void markAsRead(@PathVariable String notificationId);
}
```

---

## Summary — What Changes in Each Service

| Service | Relations to Remove | Relations to Keep |
|---|---|---|
| User & Auth | `Expense`, `Registration` from User | `AuditLog` in User |
| Event & Scheduling | `Expense`, `Contract` from Event | — |
| Venue & Resource | `Event` from ResourceAllocation | `Resource`, `Booking` in Venue; `Venue` in Resource/Booking |
| Vendor & Contract | `Invoice` from Contract; `Invoice` object from Delivery | `Contract` list in Vendor |
| Finance | `Event` from Budget; `Event`, `User` from Expense; `Contract` object from Invoice; make `invoice` nullable in Payment | `Payment` in Invoice; add `Expense` FK to Payment |
| Engagement & Feedback | `Event`, `User` objects from Engagement and FeedBack | — |
| Notification | Nothing (already clean) | — |

## application.properties — Service URLs

Add to each service's `application.properties`:

```properties
services.user.url=http://user-service:8081
services.event.url=http://event-service:8082
services.venue.url=http://venue-service:8083
services.vendor.url=http://vendor-service:8084
services.finance.url=http://finance-service:8085
services.engagement.url=http://engagement-service:8086
services.notification.url=http://notification-service:8087
```
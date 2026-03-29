# EventSphere — Role-Based End-to-End Flow

## Overview

EventSphere has 6 roles, each with a distinct scope of work across 7 microservices.

| Role | Primary Service | Port |
|---|---|---|
| `ADMIN` | User & Auth Service | 8081 |
| `ORGANIZER` | Event & Scheduling Service | 8082 |
| `VENUE_MANAGER` | Venue & Resource Service | 8083 |
| `VENDOR` | Vendor & Contract Service | 8084 |
| `FINANCE_MANAGER` | Finance Service | 8085 |
| `ATTENDEE` | Event & Scheduling + Engagement | 8082 / 8086 |

All requests go through **JWT validation** against the User & Auth Service before hitting any business logic.

---

## Complete Event Lifecycle — All Roles

```
ADMIN provisions the platform
    │
    ▼
ORGANIZER creates an event
    │
    ├──► VENUE_MANAGER registers venue & resources
    │         └── ORGANIZER books venue for the event
    │
    ├──► VENDOR onboards and signs contract
    │         └── FINANCE_MANAGER reviews and manages invoices
    │
    ├──► FINANCE_MANAGER sets budget, approves expenses, makes payments
    │
    ├──► ATTENDEE registers for the event, buys ticket
    │
    └──► ATTENDEE submits feedback after event
              └── ORGANIZER views engagement analytics
```

---

## Role 1 — ADMIN

**Service:** User & Auth Service (`http://user-service:8081`)

### What ADMIN Does

| Action | Endpoint | Notes |
|---|---|---|
| Register any user | `POST /api/v1/users` | Create ORGANIZER, VENUE_MANAGER, VENDOR, FINANCE_MANAGER, ATTENDEE accounts |
| View all users | `GET /api/v1/users` | Platform-wide visibility |
| View a specific user | `GET /api/v1/users/{userId}` | — |
| View audit logs | `GET /api/v1/audit` | All system actions are logged |
| Manage roles | `PATCH /api/v1/users/{userId}/role` | Promote/demote users |

### ADMIN Flow

```
1. ADMIN logs in
   POST /api/v1/auth/login
   → receives JWT

2. ADMIN creates accounts for other roles
   POST /api/v1/users  { name, email, password, phone, role: "ORGANIZER" }
   POST /api/v1/users  { name, email, password, phone, role: "VENUE_MANAGER" }
   POST /api/v1/users  { name, email, password, phone, role: "VENDOR" }
   POST /api/v1/users  { name, email, password, phone, role: "FINANCE_MANAGER" }
   POST /api/v1/users  { name, email, password, phone, role: "ATTENDEE" }

3. ADMIN monitors platform activity
   GET /api/v1/audit   → see all actions logged across the system
```

---

## Role 2 — ORGANIZER

**Service:** Event & Scheduling Service (`http://event-service:8082`)

### What ORGANIZER Does

| Action | Endpoint | Notes |
|---|---|---|
| Create an event | `POST /api/v1/events` | Triggers `createBudget` in Finance Service via Feign |
| View all events | `GET /api/v1/events` | — |
| Update an event | `PUT /api/v1/events/{eventId}` | — |
| Add event schedule | `POST /api/v1/events/{eventId}/schedules` | Activities/time slots |
| Create tickets | `POST /api/v1/events/{eventId}/tickets` | Ticket types and pricing |
| Book a venue | `POST /api/v1/bookings` | Triggers `recordExpense` in Finance via Feign |
| Allocate resources | `POST /api/v1/resource-allocations` | Triggers `recordExpense` in Finance via Feign |
| Add manual expense | `POST /api/v1/events/{eventId}/expenses` | Logged directly to Finance Service |
| View registrations | `GET /api/v1/events/{eventId}/registrations` | See who registered |

### ORGANIZER Flow

```
Step 1 — Create Event
POST /api/v1/events
{ name, organizerId, startDate, endDate, venueId, status: "UPCOMING" }
        │
        ▼
Event Service → [Feign] → Finance Service
                           POST /api/events/v1/{eventId}/budget
                           (budget created with actualAmount=0)
        │
        ▼
Notification Service notified (event created)

Step 2 — Add Schedule
POST /api/v1/events/{eventId}/schedules
{ eventId, date, timeSlot, activity, status }

Step 3 — Create Tickets
POST /api/v1/events/{eventId}/tickets
{ eventId, type: "VIP", price: 5000, status: "AVAILABLE" }

Step 4 — Book Venue
POST /api/v1/bookings
{ eventId, venueId, date }
        │
        ▼
Venue Service → [Feign] → Finance Service
                           POST /api/v1/events/{eventId}/expenses
                           { description: "Venue Booking", amount: 20000 }
                           → Expense created (status: PENDING)

Step 5 — Allocate Resources
POST /api/v1/resource-allocations
{ eventId, resourceId, venueId, quantity }
        │
        ▼
Venue Service → [Feign] → Finance Service
                           POST /api/v1/events/{eventId}/expenses
                           { description: "Resource Allocation", amount: 5000 }
                           → Expense created (status: PENDING)
```

---

## Role 3 — VENUE_MANAGER

**Service:** Venue & Resource Service (`http://venue-service:8083`)

### What VENUE_MANAGER Does

| Action | Endpoint | Notes |
|---|---|---|
| Register a venue | `POST /api/v1/venues` | Name, location, capacity, availability |
| Update venue availability | `PUT /api/v1/venues/{venueId}` | Mark available/unavailable |
| View all venues | `GET /api/v1/venues` | — |
| Add resource to venue | `POST /api/v1/resources` | Equipment, staff — tied to a venue |
| View bookings | `GET /api/v1/bookings` | See which events booked this venue |
| Confirm/update booking | `PATCH /api/v1/bookings/{bookingId}` | Confirm booking triggers Finance expense |

### VENUE_MANAGER Flow

```
Step 1 — Register Venue
POST /api/v1/venues
{ name: "Grand Hall", location: "Mumbai", capacity: 500, availabilityStatus: "AVAILABLE" }

Step 2 — Add Resources
POST /api/v1/resources
{ venueId, name: "Projector", type: "EQUIPMENT", costRate: 2000, unit: 3 }

POST /api/v1/resources
{ venueId, name: "Security Staff", type: "STAFF", costRate: 1000, unit: 10 }

Step 3 — View and Confirm Bookings
GET /api/v1/bookings
→ see pending bookings from organizers

PATCH /api/v1/bookings/{bookingId}
{ status: "CONFIRMED" }
        │
        ▼
Venue Service → [Feign] → Finance Service
                           Records expense (PENDING) for confirmed booking
```

---

## Role 4 — VENDOR

**Service:** Vendor & Contract Service (`http://vendor-service:8084`)

### What VENDOR Does

| Action | Endpoint | Notes |
|---|---|---|
| Register as vendor | `POST /api/v1/vendors` | Onboarding |
| View contracts | `GET /api/v1/contracts` | See contracts with organizers |
| View a contract | `GET /api/v1/contracts/{contractId}` | — |
| Confirm delivery | `POST /api/v1/deliveries` | Triggers `createInvoice` + `recordExpense` in Finance |
| View invoices | `GET /api/v1/invoices` | Finance Service — view only |

### VENDOR Flow

```
Step 1 — Vendor Onboarding
POST /api/v1/vendors
{ name: "AV Solutions", contactInfo: "...", status: "ACTIVE" }

Step 2 — Contract is Created (by ORGANIZER or ADMIN)
POST /api/v1/contracts
{ vendorId, eventId, startDate, endDate, value: 50000, status: "DRAFT" }

Step 3 — Contract Signed
PATCH /api/v1/contracts/{contractId}
{ status: "ACTIVE" }
        │
        ▼
Vendor Service → [Feign] → Finance Service
                            POST /api/v1/invoices
                            { contractId, dueDate, totalAmount: 50000 }
                            → Invoice created (status: PENDING)

Step 4 — Vendor Confirms Delivery
POST /api/v1/deliveries
{ invoiceId, item: "AV Equipment Setup", quantity: 1, deliveryDate, trackingNumber }
        │
        ▼
Vendor Service → [Feign] → Finance Service
                            POST /api/v1/events/{eventId}/expenses
                            { description: "Vendor Delivery", amount: 50000 }
                            → Expense created (status: PENDING)

Step 5 — Vendor Views Invoice Status
GET /api/v1/invoices/{invoiceId}
→ checks if Finance Manager has marked it PAID
```

---

## Role 5 — FINANCE_MANAGER

**Service:** Finance Service (`http://finance-service:8085`)

### What FINANCE_MANAGER Does

| Action | Endpoint | Notes |
|---|---|---|
| Set event budget | `POST /api/events/v1/{eventId}/budget` | Done once per event |
| View all expenses | `GET /api/v1/expenses` | All events |
| View event expenses | `GET /api/v1/events/{eventId}/expenses` | Filtered by event |
| Create manual expense | `POST /api/v1/events/{eventId}/expenses` | Miscellaneous costs |
| Approve an expense | `PATCH /expenses/{expenseId}/status?status=APPROVED` | Unlocks payment |
| Reject an expense | `PATCH /expenses/{expenseId}/status?status=REJECTED` | — |
| Make payment on expense | `POST /expenses/{expenseId}/payment` | Updates budget actual amount |
| Create vendor invoice | `POST /api/v1/invoices` | Manual invoice creation |
| Update invoice status | `PUT /api/v1/invoices/{id}` | Mark PAID when vendor is paid |
| View invoice | `GET /api/v1/invoices/{id}` | — |
| Download invoice PDF | `GET /api/v1/invoices/{invoiceId}/download` | OpenPDF generated |

### FINANCE_MANAGER Flow

```
Step 1 — Set Budget (after event is created)
POST /api/events/v1/{eventId}/budget
{ plannedAmount: 100000 }
→ Budget stored: planned=₹1,00,000 | actual=₹0 | variance=₹1,00,000

Step 2 — Expenses flow in automatically (via Feign from other services)
  Venue Service    → Expense PENDING ₹20,000  (venue booking)
  Venue Service    → Expense PENDING ₹5,000   (resource allocation)
  Vendor Service   → Expense PENDING ₹50,000  (vendor delivery)
  ORGANIZER        → Expense PENDING ₹5,000   (manual misc)

Step 3 — Review and Act on Expenses
GET /api/v1/events/{eventId}/expenses
→ see all PENDING expenses

For each expense:
  APPROVE  →  PATCH /expenses/{expenseId}/status?status=APPROVED
  REJECT   →  PATCH /expenses/{expenseId}/status?status=REJECTED

Step 4 — Make Payments on Approved Expenses
POST /expenses/{expenseId}/payment
{ method: "BANK_TRANSFER", amount: 20000, paymentDate: "2026-03-26" }
        │
        ▼
Finance Service:
  - Creates Payment record (status: COMPLETED)
  - Updates Budget: actualAmount += 20000
  - Budget: planned=₹1,00,000 | actual=₹20,000 | remaining=₹80,000

Step 5 — Manage Vendor Invoice
(Invoice auto-created when contract is signed by Vendor Service)

Review invoice:
GET /api/v1/invoices/{invoiceId}

Mark as paid:
PUT /api/v1/invoices/{invoiceId}
{ status: "PAID" }

Download for records:
GET /api/v1/invoices/{invoiceId}/download
→ returns PDF

Step 6 — Final Budget Summary (after all payments)
GET /api/v1/events/{eventId}/budget
→ planned=₹1,00,000 | actual=₹80,000 | variance=₹20,000 (under budget)
```

### Payment Rules (Finance Service Internal)

```
Payment must be linked to exactly one of:
  - invoice  (for vendor invoice payments)
  - expense  (for venue, resource, manual expense payments)

Both cannot be null. Both cannot be set simultaneously.

Budget actualAmount is updated ONLY when paying an expense — NOT on invoice status changes.
(Invoice payments and expense payments are separate flows.)
```

---

## Role 6 — ATTENDEE

**Services:** Event & Scheduling (`8082`), Engagement & Feedback (`8086`)

### What ATTENDEE Does

| Action | Endpoint | Notes |
|---|---|---|
| Browse events | `GET /api/v1/events` | See upcoming events |
| Register for event | `POST /api/v1/registrations` | Pick event + ticket |
| View own registrations | `GET /api/v1/registrations?attendeeId={id}` | — |
| Submit feedback | `POST /api/v1/feedbacks` | Post-event rating + comments |
| Record engagement | `POST /api/v1/engagements` | Views, clicks, shares (auto-tracked) |

### ATTENDEE Flow

```
Step 1 — Browse Events
GET /api/v1/events
→ sees list of UPCOMING events

Step 2 — Register for Event
POST /api/v1/registrations
{ eventId, ticketId, attendeeId, date }
→ Registration created (status: CONFIRMED)
        │
        ▼
Notification Service notified → "Registration confirmed for [Event Name]"

Step 3 — Attend Event

Step 4 — Submit Feedback (post-event)
POST /api/v1/feedbacks
{ eventId, attendeeId, rating: 4, comments: "Great event!" }

Step 5 — Engagement auto-tracked
POST /api/v1/engagements
{ eventId, attendeeId, activity: "VIEW" / "CLICK" / "SHARE" }
```

---

## Cross-Service Feign Call Map

```
┌─────────────────────────────────────────────────────────────────┐
│                    ALL SERVICES                                  │
│         JWT Validation → User & Auth Service (8081)             │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐     createBudget()        ┌──────────────────┐
│  Event Service   │ ─────────────────────────► │ Finance Service  │
│    (8082)        │                            │    (8085)        │
└──────────────────┘                            │                  │
                                                │                  │
┌──────────────────┐     recordExpense()        │                  │
│  Venue Service   │ ─────────────────────────► │                  │
│    (8083)        │  (booking confirmed)       │                  │
│                  │ ─────────────────────────► │                  │
│                  │  (resource allocated)      │                  │
└──────────────────┘                            │                  │
                                                │                  │
┌──────────────────┐     createInvoice()        │                  │
│  Vendor Service  │ ─────────────────────────► │                  │
│    (8084)        │  (contract signed)         │                  │
│                  │     recordExpense()        │                  │
│                  │ ─────────────────────────► │                  │
│                  │  (delivery confirmed)      └──────────────────┘
└──────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  ANY SERVICE → Notification Service (8087)                       │
│  Key state changes trigger sendNotification(userId, message)     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Complete End-to-End Scenario

### "Tech Summit 2026" — Full Lifecycle

```
Day 1 — Setup

  ADMIN
  └── Creates accounts for ORGANIZER (Ash), VENUE_MANAGER (Raj),
      VENDOR (AV Solutions), FINANCE_MANAGER (Priya), ATTENDEE (users)

  VENUE_MANAGER (Raj)
  └── POST /api/v1/venues          → registers "Grand Hall" (capacity: 500)
  └── POST /api/v1/resources       → adds "Projector x3", "Security Staff x10"

Day 2 — Event Creation

  ORGANIZER (Ash)
  └── POST /api/v1/events          → creates "Tech Summit 2026"
        └── [Feign] Finance Service creates Budget (actual=0)
  └── POST /api/v1/schedules       → adds Day 1 / Day 2 agenda
  └── POST /api/v1/tickets         → creates "GENERAL ₹2000", "VIP ₹5000"
  └── POST /api/v1/bookings        → books "Grand Hall"
        └── [Feign] Finance Service logs Expense PENDING ₹20,000

  FINANCE_MANAGER (Priya)
  └── POST /api/events/v1/{id}/budget  → sets Budget ₹1,00,000

Day 3 — Vendor Setup

  VENDOR (AV Solutions)
  └── POST /api/v1/vendors         → onboards

  ORGANIZER (Ash)
  └── POST /api/v1/contracts       → creates contract with AV Solutions ₹50,000
  └── PATCH /api/v1/contracts/{id} → signs contract (status: ACTIVE)
        └── [Feign] Finance Service creates Invoice PENDING ₹50,000

Day 4–7 — Registrations

  ATTENDEE (users)
  └── POST /api/v1/registrations   → register + pick ticket
        └── [Feign/Event] Notification Service sends confirmation email

Day 8 — Event Day

  VENUE_MANAGER (Raj)
  └── PATCH /api/v1/bookings/{id}  → confirms booking
        └── [Feign] Finance Service records Expense PENDING ₹20,000

  VENDOR (AV Solutions)
  └── POST /api/v1/deliveries      → confirms AV equipment delivered
        └── [Feign] Finance Service records Expense PENDING ₹50,000

  FINANCE_MANAGER (Priya)
  └── GET  /api/v1/events/{id}/expenses  → reviews all PENDING expenses
  └── PATCH /expenses/{id}/status        → approves venue expense ₹20,000
  └── POST  /expenses/{id}/payment       → pays ₹20,000 (Bank Transfer)
        └── Budget: actual=₹20,000 | remaining=₹80,000
  └── PATCH /expenses/{id}/status        → approves vendor expense ₹50,000
  └── POST  /expenses/{id}/payment       → pays ₹50,000
        └── Budget: actual=₹70,000 | remaining=₹30,000
  └── PUT   /api/v1/invoices/{id}        → marks Invoice PAID
  └── GET   /api/v1/invoices/{id}/download → downloads PDF for records

Day 9 — Post Event

  ATTENDEE (users)
  └── POST /api/v1/feedbacks        → submit ratings and comments
  └── POST /api/v1/engagements      → engagement tracked

  ORGANIZER (Ash)
  └── GET /api/v1/events/{id}/engagements → view engagement analytics
  └── GET /api/v1/events/{id}/rating      → see average rating

Final Budget:
  Planned  : ₹1,00,000
  Actual   : ₹70,000
  Variance : ₹30,000  (under budget ✓)
```

---

## Role Access Summary

| Endpoint Group | ADMIN | ORGANIZER | VENUE_MANAGER | VENDOR | FINANCE_MANAGER | ATTENDEE |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| `/api/v1/users` | ✓ | — | — | — | — | — |
| `/api/v1/audit` | ✓ | — | — | — | — | — |
| `/api/v1/events` | ✓ | ✓ | — | — | — | ✓ (read) |
| `/api/v1/schedules` | ✓ | ✓ | — | — | — | ✓ (read) |
| `/api/v1/tickets` | ✓ | ✓ | — | — | — | ✓ (read) |
| `/api/v1/registrations` | ✓ | ✓ (view) | — | — | — | ✓ |
| `/api/v1/venues` | ✓ | ✓ (read) | ✓ | — | — | — |
| `/api/v1/bookings` | ✓ | ✓ | ✓ | — | — | — |
| `/api/v1/resources` | ✓ | — | ✓ | — | — | — |
| `/api/v1/resource-allocations` | ✓ | ✓ | ✓ | — | — | — |
| `/api/v1/vendors` | ✓ | — | — | ✓ | — | — |
| `/api/v1/contracts` | ✓ | ✓ | — | ✓ | — | — |
| `/api/v1/deliveries` | ✓ | — | — | ✓ | — | — |
| `/api/events/v1/{id}/budget` | ✓ | — | — | — | ✓ | — |
| `/api/v1/expenses` | ✓ | ✓ (create) | — | — | ✓ | — |
| `/expenses/{id}/status` | ✓ | — | — | — | ✓ | — |
| `/expenses/{id}/payment` | ✓ | — | — | — | ✓ | — |
| `/api/v1/invoices` | ✓ | — | — | ✓ (read) | ✓ | — |
| `/api/v1/feedbacks` | ✓ | ✓ (read) | — | — | — | ✓ |
| `/api/v1/engagements` | ✓ | ✓ (read) | — | — | — | ✓ |
| `/api/v1/notifications` | ✓ | — | — | — | — | ✓ (own) |

---

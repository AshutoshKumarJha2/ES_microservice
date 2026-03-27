# EventSphere Microservices Architecture

## Overview

EventSphere is decomposed into **7 microservices**, each owning its domain, database schema, and REST API. Inter-service communication uses **OpenFeign** (synchronous REST calls).

---

## Services

### 1. User & Auth Service
**Entities:** `User`, `AuditLog`
**Responsibilities:**
- User registration and login
- JWT token issuance and validation
- Role management (ADMIN, ORGANIZER, ATTENDEE, VENUE_MANAGER, FINANCE_MANAGER, VENDOR)
- Audit trail logging

**Roles served:** All roles (every service validates tokens against this service)

---

### 2. Event & Scheduling Service
**Entities:** `Event`, `Schedule`, `Ticket`, `Registration`
**Responsibilities:**
- Create and manage events
- Manage event schedules and activities
- Create and sell tickets
- Handle attendee registrations

**Feign calls out to:**
- Finance Service — create budget when event is created

---

### 3. Venue & Resource Service
**Entities:** `Venue`, `Booking`, `Resource`, `ResourceAllocation`
**Responsibilities:**
- Venue CRUD and availability tracking
- Venue bookings linked to events
- Equipment and staff resource management
- Resource allocation to events

**Feign calls out to:**
- Finance Service — log expense when booking is confirmed
- Finance Service — log expense when resource is allocated

---

### 4. Vendor & Contract Service
**Entities:** `Vendor`, `Contract`, `Delivery`
**Responsibilities:**
- Vendor onboarding and profile management
- Contract lifecycle (draft → active → completed)
- Delivery tracking for contract deliverables

**Feign calls out to:**
- Finance Service — create invoice when contract is signed
- Finance Service — log expense when delivery is confirmed

---

### 5. Finance Service
**Entities:** `Budget`, `Expense`, `Invoice`, `Payment`
**Responsibilities:**
- Set and track event budgets (planned vs actual vs variance)
- Review and approve/reject expenses
- Make payments against approved expenses
- Create and manage vendor invoices
- Generate invoice PDFs
- Track payment methods and status

**Role:** `FINANCE_MANAGER`
- Sets budgets
- Approves/rejects expenses
- Makes payments
- Manages invoices

**Receives Feign calls from:**
- Event Service (create budget)
- Venue & Resource Service (log expense)
- Vendor & Contract Service (create invoice, log expense)

---

### 6. Engagement & Feedback Service
**Entities:** `Engagement`, `FeedBack`
**Responsibilities:**
- Track user interactions with events (views, clicks, shares)
- Collect post-event ratings and comments
- Provide engagement analytics

**Notes:** Read-heavy, scales independently from transactional services.

---

### 7. Notification Service
**Entities:** `Notification` + Email
**Responsibilities:**
- Send in-app notifications to users
- Dispatch emails asynchronously
- Manage notification read status and categories

**Receives Feign calls from:** All other services

---

## Inter-Service Communication

| Caller | Calls | When | Method |
|---|---|---|---|
| Event Service | Finance Service | Event created | `createBudget(eventId, amount)` |
| Venue Service | Finance Service | Booking confirmed | `recordExpense(eventId, VENUE, cost)` |
| Venue Service | Finance Service | Resource allocated | `recordExpense(eventId, RESOURCE, cost)` |
| Contract Service | Finance Service | Contract signed | `createInvoice(contractId, amount)` |
| Contract Service | Finance Service | Delivery confirmed | `recordExpense(eventId, amount)` |
| Any Service | Notification Service | Key state changes | `sendNotification(userId, message)` |
| All Services | User & Auth Service | Every request | JWT validation |

---

## Roles & Service Access

| Role | Primary Service | Can Also Access |
|---|---|---|
| `ADMIN` | User & Auth Service | All services |
| `ORGANIZER` | Event & Scheduling Service | Venue, Vendor, Finance (expenses) |
| `ATTENDEE` | Event & Scheduling Service | Engagement & Feedback |
| `VENUE_MANAGER` | Venue & Resource Service | — |
| `FINANCE_MANAGER` | Finance Service | — |
| `VENDOR` | Vendor & Contract Service | Finance (view invoices) |

---

## Finance Manager Flow

> Note: The codebase currently has two roles — `FINANCE_MANAGER` and `FINANCE_OFFICER` — that serve the same purpose. In the microservices migration, these will be consolidated into a single `FINANCE_MANAGER` role.

---

### What Finance Manager Can Do

| Action | Endpoint |
|---|---|
| Set budget for an event | `POST /api/events/v1/{eventId}/budget` |
| View all expenses | `GET /api/v1/expenses` |
| View expenses for a specific event | `GET /api/v1/events/{eventId}/expenses` |
| Create an expense manually | `POST /api/v1/events/{eventId}/expenses` |
| Approve or reject an expense | `PATCH /expenses/{expenseId}/status` |
| Make a payment on an approved expense | `POST /expenses/{expenseId}/payment` |
| Create a vendor invoice | `POST /api/v1/invoices` |
| Update invoice status | `PUT /api/v1/invoices/{id}` |
| View an invoice | `GET /api/v1/invoices/{id}` |
| Download invoice PDF | `GET /api/v1/invoices/{invoiceId}/download` |

---

### Step 1 — Budget Setup (before event starts)

```
ORGANIZER creates an event
        │
        ▼
FINANCE_MANAGER sets the budget
POST /api/events/v1/{eventId}/budget
{ plannedAmount: 1,00,000 }
        │
        ▼
Finance Service stores:
  planned_amount = 1,00,000
  actual_amount  = 0
  variance       = 1,00,000
```

---

### Step 2 — Expenses flow in (from other services via Feign)

```
Venue Service          ──[Feign]──►  Finance Service logs Expense (PENDING, ₹20,000)
Contract Service       ──[Feign]──►  Finance Service logs Expense (PENDING, ₹50,000)
ORGANIZER manually     ──[POST]───►  Finance Service logs Expense (PENDING, ₹5,000)
```

All expenses land as **PENDING** — Finance Manager has not reviewed them yet.

---

### Step 3 — Finance Manager reviews expenses

```
FINANCE_MANAGER opens dashboard
GET /api/v1/events/{eventId}/expenses
→ sees list of PENDING expenses

        ┌──────────────────────────────────┐
        │  Expense: Venue Booking ₹20,000  │
        │  Expense: Catering vendor ₹50,000│
        │  Expense: Decorations ₹5,000     │
        └──────────────────────────────────┘
                        │
            ┌───────────┴───────────┐
          APPROVE                REJECT
            │
            ▼
PATCH /expenses/{expenseId}/status?status=APPROVED
```

---

### Step 4 — Finance Manager makes payment on approved expense

```
Expense is APPROVED
        │
        ▼
FINANCE_MANAGER triggers payment
POST /expenses/{expenseId}/payment
{ method: "bank_transfer", amount: 20000 }
        │
        ▼
Finance Service:
  - Creates Payment record (COMPLETED)
  - Updates Budget actual_amount += 20,000
  - Budget: planned=1,00,000 | actual=20,000 | remaining=80,000
```

---

### Step 5 — Vendor Invoice flow

```
Vendor confirms delivery
        │
        ▼
Contract Service ──[Feign]──► Finance Service
                               createInvoice(contractId, ₹50,000)
                                        │
                                        ▼
                               Invoice created (status: PENDING)
                                        │
                                        ▼
FINANCE_MANAGER reviews and updates invoice
PUT /api/v1/invoices/{id}  →  status: PAID
                                        │
                                        ▼
FINANCE_MANAGER downloads PDF for records
GET /api/v1/invoices/{invoiceId}/download
```

---

### Full Event Lifecycle — Finance Perspective

```
Event Created
    │
    ├─[1]─ FINANCE_MANAGER sets Budget ₹1,00,000
    │
    ├─[2]─ Venue booked ──► Expense PENDING ₹20,000
    │           └── FINANCE_MANAGER approves + pays → actual: ₹20,000
    │
    ├─[3]─ Vendor contracted ──► Expense PENDING ₹50,000
    │           └── FINANCE_MANAGER approves + pays → actual: ₹70,000
    │           └── FINANCE_MANAGER creates Invoice → marks PAID
    │
    ├─[4]─ ORGANIZER adds misc expense ₹5,000
    │           └── FINANCE_MANAGER approves + pays → actual: ₹75,000
    │
    └─[5]─ Event ends
               Budget Summary:
               Planned  : ₹1,00,000
               Actual   : ₹75,000
               Variance : ₹25,000  (under budget)
```

---

### Key Rule — Finance Manager Never Touches Other Services

Finance Manager only works inside the **Finance Service**. They never call Venue, Contract, or Event services directly.
Other services push data into Finance via Feign — Finance Manager only reviews and acts on what comes in.

---

## Each Service Owns

- Its own Spring Boot application
- Its own MySQL schema
- Its own JWT validation (via shared public key from User & Auth Service)
- Its own Docker container
- Feign client interfaces to communicate with other services

---

## Technology Stack

| Concern | Technology |
|---|---|
| Framework | Spring Boot |
| Inter-service communication | OpenFeign |
| Database | MySQL (separate schema per service) |
| Authentication | JWT (validated per service) |
| Resilience | Resilience4j (circuit breaker + fallback) |
| API Documentation | SpringDoc OpenAPI |
| PDF Generation | OpenPDF (Finance Service) |
| Email | Spring Mail (Notification Service) |
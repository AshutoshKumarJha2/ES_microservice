# Expense Manager Microservice — Complete Code Explanation

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Tech Stack & Dependencies](#2-tech-stack--dependencies)
3. [Package Structure](#3-package-structure)
4. [Application Entry Point](#4-application-entry-point)
5. [Configuration](#5-configuration)
6. [Entity Layer (Database Models)](#6-entity-layer-database-models)
7. [Enums (Status & Type Constants)](#7-enums-status--type-constants)
8. [Repository Layer (Data Access)](#8-repository-layer-data-access)
9. [DTO Layer (Data Transfer Objects)](#9-dto-layer-data-transfer-objects)
10. [Mapper Layer (Entity ↔ DTO Conversion)](#10-mapper-layer-entity--dto-conversion)
11. [Feign Clients (Inter-Service Communication)](#11-feign-clients-inter-service-communication)
12. [Service Layer (Business Logic)](#12-service-layer-business-logic)
13. [Controller Layer (REST Endpoints)](#13-controller-layer-rest-endpoints)
14. [Exception Handling](#14-exception-handling)
15. [Security (Authentication & Authorization)](#15-security-authentication--authorization)
16. [Audit & Notification (Cross-Cutting Concerns)](#16-audit--notification-cross-cutting-concerns)
17. [Complete Request-Response Flow (End-to-End)](#17-complete-request-response-flow-end-to-end)
18. [API Endpoint Summary](#18-api-endpoint-summary)

---

## 1. Project Overview

The **Expense Manager** is a Spring Boot microservice that is part of the **EventSphere** platform. It is responsible for managing all financial operations related to events — creating budgets, tracking expenses, approving/rejecting expenses, processing payments, and keeping budget utilization up to date.

### What this service does:
- **Budget Management** — Create a financial plan for an event (plannedAmount), track actual spending, and calculate variance (how much over/under budget the event is)
- **Expense Tracking** — Submit expenses against events, with a full lifecycle: SUBMITTED → APPROVED/REJECTED → PAID
- **Payment Processing** — Record payments against approved expenses and automatically update the event's budget
- **Cross-Service Validation** — Before creating an expense or budget, validate that the event actually exists by calling the Event Manager service via Feign
- **Audit Logging** — Every create, read, update, delete operation sends an audit log to the centralized Log Manager service
- **Notifications** — Key actions (budget created, expense submitted, payment processed) trigger user notifications via Log Manager

### Where it fits in EventSphere:

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ Auth Manager │     │Event Manager │     │ Log Manager  │
│  (port 8081) │     │ (port 7070)  │     │              │
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                    │                     │
       │ validates JWT      │ validates event     │ receives audit
       │ tokens             │ exists              │ & notifications
       │                    │                     │
       └────────────────────┼─────────────────────┘
                            │
                   ┌────────┴────────┐
                   │ EXPENSE MANAGER │
                   │   (port 7099)   │
                   └─────────────────┘
```

---

## 2. Tech Stack & Dependencies

| Dependency | Purpose |
|-----------|---------|
| `spring-boot-starter-web` | REST API framework (embedded Tomcat, @RestController, etc.) |
| `spring-boot-starter-data-jpa` | ORM layer — maps Java entities to database tables using Hibernate |
| `spring-boot-starter-validation` | Bean Validation (`@NotNull`, `@Positive`, `@NotBlank`) on DTOs |
| `spring-boot-starter-security` | Authentication & authorization (`@PreAuthorize`, SecurityFilterChain) |
| `spring-cloud-starter-openfeign` | Declarative HTTP clients to call other microservices |
| `spring-cloud-starter-netflix-eureka-client` | Service registration/discovery with Eureka |
| `spring-cloud-starter-config` | Pulls config from centralized Config Server |
| `mysql-connector-j` | MySQL JDBC driver for database connectivity |
| `lombok` | Reduces boilerplate — `@Data`, `@Builder`, `@RequiredArgsConstructor`, `@Slf4j` |
| `springdoc-openapi` | Auto-generates Swagger/OpenAPI docs at `/swagger-ui.html` |
| `spring-boot-devtools` | Auto-restart on code changes during development |
| `logback` | Structured logging with file rotation and archiving |

---

## 3. Package Structure

```
com.cts.eventsphere.expensemanager
│
├── ExpenseManagerApplication.java          ← App entry point
├── HealthCheckController.java              ← /health endpoint
│
├── auth/                                   ← Security layer
│   ├── client/
│   │   └── IAMClient.java                 ← Feign client to auth-manager for JWT validation
│   ├── config/
│   │   └── SecurityConfig.java            ← Spring Security configuration
│   ├── dto/
│   │   ├── UserPrincipal.java             ← Authenticated user details (userId, email, role)
│   │   └── ValidateResponse.java          ← Response from auth-manager /validate
│   ├── filter/
│   │   └── JwtAuthFilter.java             ← Extracts JWT from header, validates via auth-manager
│   └── service/
│       └── AuthService.java               ← Calls IAMClient.validate(), builds UserPrincipal
│
├── client/                                 ← Feign clients (outbound HTTP calls)
│   ├── EventServiceClient.java            ← Calls event-manager to verify event exists
│   ├── AuditClient.java                   ← Sends audit logs to log-manager
│   ├── LogServiceClient.java              ← Sends notifications to log-manager
│   └── dto/
│       └── EventResponseDto.java          ← DTO to deserialize event-manager response
│
├── controllers/                            ← REST endpoints (inbound HTTP)
│   ├── BudgetController.java              ← POST/GET /events/{eventId}/budget
│   └── ExpenseController.java             ← CRUD for expenses + payments
│
├── dto/                                    ← Data Transfer Objects
│   ├── request/
│   │   ├── BudgetRequestDto.java
│   │   ├── ExpenseRequestDto.java
│   │   └── PaymentRequestDto.java
│   ├── response/
│   │   ├── BudgetResponseDto.java
│   │   ├── ExpenseResponseDto.java
│   │   └── PaymentResponseDto.java
│   ├── mapper/                            ← Entity ↔ DTO converters
│   │   ├── BudgetRequestDtoMapper.java
│   │   ├── BudgetResponseDtoMapper.java
│   │   ├── ExpenseRequestDtoMapper.java
│   │   ├── ExpenseResponseDtoMapper.java
│   │   ├── PaymentRequestDtoMapper.java
│   │   └── PaymentResponseDtoMapper.java
│   └── audit/
│       ├── AuditAction.java               ← Enum: CREATE, READ, UPDATE, DELETE, APPROVE, etc.
│       └── AuditLogRequestDto.java        ← Payload sent to log-manager audit endpoint
│
├── entity/                                 ← JPA entities (database tables)
│   ├── Budget.java
│   ├── Expense.java
│   ├── Payment.java
│   └── data/                              ← Enums used by entities
│       ├── ExpenseStatus.java             ← SUBMITTED, APPROVED, REJECTED, PAID, CANCELLED
│       ├── PaymentMethod.java             ← CREDIT_CARD, BANK_TRANSFER, UPI, CASH, etc.
│       └── PaymentStatus.java             ← COMPLETED, PENDING, FAILED, REFUNDED
│
├── exception/                              ← Custom exceptions + global handler
│   ├── BudgetAlreadyExistsException.java
│   ├── BudgetNotFoundException.java
│   ├── EventServiceException.java
│   ├── ExpenseNotFoundException.java
│   ├── InvalidExpenseStateException.java
│   └── GlobalExceptionHandler.java        ← @ControllerAdvice — catches all exceptions
│
├── repository/                             ← Spring Data JPA repositories
│   ├── BudgetRepository.java
│   ├── ExpenseRepository.java
│   └── PaymentRepository.java
│
└── service/                                ← Business logic
    ├── BudgetService.java                 ← Interface
    ├── ExpenseService.java                ← Interface
    ├── AuditService.java                  ← Interface
    └── impl/
        ├── BudgetServiceImpl.java         ← Budget creation, retrieval, validation
        ├── ExpenseServiceImpl.java        ← Expense CRUD, status workflow, payments
        └── AuditServiceImpl.java          ← Fire-and-forget audit logging via Feign
```

---

## 4. Application Entry Point

**File:** `ExpenseManagerApplication.java`

```java
@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients
public class ExpenseManagerApplication {
    public static void main(String[] args) {
        SpringApplication.run(ExpenseManagerApplication.class, args);
    }
}
```

Three annotations do all the heavy lifting:

- **`@SpringBootApplication`** — Combines `@Configuration` + `@EnableAutoConfiguration` + `@ComponentScan`. Spring Boot auto-configures everything (DataSource, JPA, Web, Security) based on what dependencies are in pom.xml.
- **`@EnableDiscoveryClient`** — Registers this service with **Eureka Server** (at `localhost:6969`). Other services can discover expense-manager by name instead of hardcoded URLs.
- **`@EnableFeignClients`** — Scans for `@FeignClient` interfaces and creates proxy implementations at runtime. This is what makes `EventServiceClient`, `AuditClient`, `LogServiceClient`, and `IAMClient` work.

---

## 5. Configuration

**File:** `application.yml`

```yaml
spring:
  application:
    name: expense-manager          # Eureka registration name
  config:
    import: configserver:http://localhost:6971   # Pulls DB credentials, etc. from Config Server
  profiles:
    active: local

server:
  port: 7099                       # This service runs on port 7099

eureka:
  client:
    service-url:
      defaultZone: http://localhost:6969/eureka   # Eureka Server address
```

### How config works:
1. On startup, expense-manager contacts **Config Server** (port 6971)
2. Config Server returns the database URL, username, password, JPA properties for the `local` profile
3. This is why there's no `spring.datasource.url` in this file — it comes from Config Server
4. The service then registers itself with **Eureka** as `EXPENSE-MANAGER`

---

## 6. Entity Layer (Database Models)

### 6.1 Budget Entity

**File:** `entity/Budget.java`

```java
@Entity
@Table(name = "budgets")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Budget {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String budgetId;

    @Column(nullable = false, unique = true)
    private String eventId;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal plannedAmount;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal actualAmount;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal variance;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
```

**What each field means:**
- `budgetId` — Auto-generated UUID primary key
- `eventId` — Links this budget to an event (unique constraint = one budget per event)
- `plannedAmount` — How much money was allocated for the event
- `actualAmount` — How much has actually been spent (updated when payments are made)
- `variance` — `plannedAmount - actualAmount` (positive = under budget, negative = over budget)
- `createdAt` / `updatedAt` — Auto-managed timestamps by Hibernate

### 6.2 Expense Entity

**File:** `entity/Expense.java`

```java
@Entity
@Table(name = "expenses")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Expense {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String expenseId;

    @Column(nullable = false)
    private String eventId;

    private String description;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false)
    private LocalDate date;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ExpenseStatus status;

    private String submittedBy;
    private String approvedBy;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
```

**Key design decisions:**
- `status` is stored as a STRING in the database (`@Enumerated(EnumType.STRING)`) — not an integer. This makes the database human-readable.
- `submittedBy` and `approvedBy` store user IDs — tracks who created and who approved/rejected the expense.
- An expense belongs to an event (via `eventId`) but there's no JPA `@ManyToOne` relationship because the event lives in a DIFFERENT database (event-manager's DB). In microservices, we don't use foreign keys across services — we use the eventId string and validate via Feign call.

### 6.3 Payment Entity

**File:** `entity/Payment.java`

```java
@Entity
@Table(name = "payments")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String paymentId;

    private String expenseId;
    private String invoiceId;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentMethod method;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status;

    @Column(nullable = false)
    private LocalDateTime paymentDate;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
```

**Why `expenseId` and `invoiceId` are separate:** A payment can settle either an expense or an invoice. When paying an expense, `expenseId` is set and `invoiceId` is null. This allows flexibility for future invoice-based payments.

---

## 7. Enums (Status & Type Constants)

### ExpenseStatus — Lifecycle of an expense
```
SUBMITTED → APPROVED → PAID
                ↘ REJECTED
SUBMITTED → CANCELLED
```

| Value | Meaning |
|-------|---------|
| `SUBMITTED` | Expense just created, awaiting approval |
| `APPROVED` | Finance manager approved it, ready for payment |
| `REJECTED` | Finance manager rejected it |
| `PAID` | Payment has been processed |
| `CANCELLED` | Expense was cancelled |

### PaymentMethod
`CREDIT_CARD`, `DEBIT_CARD`, `BANK_TRANSFER`, `UPI`, `CASH`, `CHEQUE`, `WALLET`, `OTHER`

### PaymentStatus
`COMPLETED`, `PENDING`, `FAILED`, `REFUNDED`

---

## 8. Repository Layer (Data Access)

### BudgetRepository
```java
public interface BudgetRepository extends JpaRepository<Budget, String> {
    Optional<Budget> findByEventId(String eventId);
}
```
- Extends `JpaRepository` — gives us `save()`, `findById()`, `findAll()`, `deleteById()` for free
- **Custom query:** `findByEventId()` — Spring Data auto-generates the SQL from the method name: `SELECT * FROM budgets WHERE event_id = ?`

### ExpenseRepository
```java
public interface ExpenseRepository extends JpaRepository<Expense, String> {
    List<Expense> findByEventId(String eventId);
    Page<Expense> findByEventId(String eventId, Pageable pageable);
}
```
- Two versions of `findByEventId`:
  - `List` version — returns all expenses for an event (used internally)
  - `Page` version — returns paginated results (used by the REST API with `?page=0&size=10`)

### PaymentRepository
```java
public interface PaymentRepository extends JpaRepository<Payment, String> { }
```
- No custom queries needed — just basic CRUD operations

---

## 9. DTO Layer (Data Transfer Objects)

DTOs are Java `record` classes — immutable, concise, with auto-generated constructor, getters, `equals()`, `hashCode()`, and `toString()`.

### Why DTOs?
1. **Security** — Never expose entity fields like `createdAt`, `updatedAt` directly
2. **Decoupling** — API response format is independent of database schema
3. **Validation** — Request DTOs carry `@NotNull`, `@Positive` annotations

### Request DTOs (What the client sends)

**BudgetRequestDto:**
```java
public record BudgetRequestDto(
    @NotNull @Positive BigDecimal plannedAmount
) {}
```
Only needs `plannedAmount`. `actualAmount` starts at 0, `variance` = `plannedAmount`.

**ExpenseRequestDto:**
```java
public record ExpenseRequestDto(
    @NotBlank String description,
    @NotNull @Positive BigDecimal amount,
    @NotNull LocalDate date
) {}
```
The `eventId` comes from the URL path (`/events/{eventId}/expenses`), not the body.

**PaymentRequestDto:**
```java
public record PaymentRequestDto(
    @NotNull @Positive BigDecimal amount,
    @NotNull PaymentMethod method,
    @NotNull LocalDateTime paymentDate
) {}
```

### Response DTOs (What the client receives)

**BudgetResponseDto:**
```java
public record BudgetResponseDto(
    String budgetId, String eventId,
    BigDecimal plannedAmount, BigDecimal actualAmount, BigDecimal variance,
    LocalDateTime createdAt, LocalDateTime updatedAt
) {}
```
Returns everything including computed `variance`.

**ExpenseResponseDto:**
```java
public record ExpenseResponseDto(
    String expenseId, String eventId,
    String description, BigDecimal amount, LocalDate date,
    ExpenseStatus status,
    String submittedBy, String approvedBy,
    LocalDateTime createdAt, LocalDateTime updatedAt
) {}
```

**PaymentResponseDto:**
```java
public record PaymentResponseDto(
    String paymentId, String expenseId, String invoiceId,
    BigDecimal amount, PaymentMethod method, PaymentStatus status,
    LocalDateTime paymentDate,
    LocalDateTime createdAt, LocalDateTime updatedAt
) {}
```

---

## 10. Mapper Layer (Entity ↔ DTO Conversion)

Mappers are **static utility classes** — no Spring `@Component`, no instance state. Just pure functions.

### Example: ExpenseRequestDtoMapper
```java
public final class ExpenseRequestDtoMapper {
    private ExpenseRequestDtoMapper() {}   // prevent instantiation

    public static Expense toEntity(ExpenseRequestDto dto, String eventId) {
        return Expense.builder()
                .eventId(eventId)
                .description(dto.description())
                .amount(dto.amount())
                .date(dto.date())
                .status(ExpenseStatus.SUBMITTED)    // always starts as SUBMITTED
                .build();
    }
}
```

### Example: ExpenseResponseDtoMapper
```java
public final class ExpenseResponseDtoMapper {
    private ExpenseResponseDtoMapper() {}

    public static ExpenseResponseDto toDto(Expense entity) {
        return new ExpenseResponseDto(
                entity.getExpenseId(), entity.getEventId(),
                entity.getDescription(), entity.getAmount(), entity.getDate(),
                entity.getStatus(),
                entity.getSubmittedBy(), entity.getApprovedBy(),
                entity.getCreatedAt(), entity.getUpdatedAt()
        );
    }
}
```

**Why static methods instead of MapStruct/ModelMapper?**
- Zero dependencies
- Full control over mapping logic (e.g., setting default status to SUBMITTED)
- Easy to understand and debug
- No reflection magic

---

## 11. Feign Clients (Inter-Service Communication)

Feign clients are the core of microservice communication. They let you call another service's REST API as if it were a local Java method.

### 11.1 EventServiceClient — Validates events exist

```java
@FeignClient(name = "event-manager", path = "/api/v1/events")
public interface EventServiceClient {
    @GetMapping("/{eventId}")
    EventResponseDto getEventById(@PathVariable String eventId);
}
```

**How it works:**
1. `name = "event-manager"` — Feign asks Eureka: "Give me the address of EVENT-MANAGER"
2. Eureka responds: `http://192.168.x.x:7070`
3. Feign constructs the full URL: `http://192.168.x.x:7070/api/v1/events/{eventId}`
4. Makes a GET request and deserializes the JSON response into `EventResponseDto`

**Why we need this:** Before creating a budget or expense for event "EVT-123", we verify that event actually exists. If event-manager returns 404, we throw `EventServiceException("Event not found")`.

### 11.2 AuditClient — Sends audit logs

```java
@FeignClient(name = "log-manager", contextId = "auditClient", path = "/audits")
public interface AuditClient {
    @PostMapping
    ResponseEntity<Void> createAudit(@RequestBody AuditLogRequestDto dto);
}
```

**`contextId`** is required because we have TWO Feign clients pointing to `log-manager` (AuditClient and LogServiceClient). Without unique contextIds, Spring would throw a bean naming conflict.

### 11.3 LogServiceClient — Sends notifications

```java
@FeignClient(name = "log-manager", contextId = "logServiceClient", path = "/notifications")
public interface LogServiceClient {
    @PostMapping("/send")
    ResponseEntity<Void> sendNotification(
            @RequestParam String userId,
            @RequestParam String message,
            @RequestParam String category
    );
}
```

Note: Uses `@RequestParam` (query parameters), NOT `@RequestBody`. The log-manager expects: `POST /notifications/send?userId=xxx&message=yyy&category=EXPENSE`

### 11.4 IAMClient — Validates JWT tokens

```java
@FeignClient(name = "AUTH-MANAGER", url = "${services.auth.url}")
public interface IAMClient {
    @GetMapping("/auth/validate")
    ValidateResponse validate(@RequestHeader("Authorization") String token);
}
```

**Different from others:** Uses `url = "${services.auth.url}"` (hardcoded URL from application.yml) instead of Eureka discovery. This is because authentication must work even if Eureka is temporarily down.

---

## 12. Service Layer (Business Logic)

### 12.1 BudgetServiceImpl

**Creates and retrieves budgets for events.**

#### `createBudget(String eventId, BudgetRequestDto request)`
```
Step 1: fetchEvent(eventId)              → Calls event-manager via Feign to verify event exists
Step 2: findByEventId(eventId)           → Check if budget already exists → throw BudgetAlreadyExistsException
Step 3: Map DTO → Entity                 → Set actualAmount = 0, variance = plannedAmount
Step 4: budgetRepository.save(budget)    → Persist to database
Step 5: auditService.logAudit(CREATE)    → Send audit log to log-manager
Step 6: notifyUser(...)                  → Send notification "Budget created"
Step 7: Return BudgetResponseDto
```

#### `getBudgetByEventId(String eventId)`
```
Step 1: findByEventId(eventId)           → Find budget or throw BudgetNotFoundException
Step 2: auditService.logAudit(READ)      → Log the read action
Step 3: Return BudgetResponseDto
```

#### `fetchEvent(String eventId)` — Private helper
```java
private EventResponseDto fetchEvent(String eventId) {
    try {
        return eventServiceClient.getEventById(eventId);
    } catch (FeignException.NotFound ex) {
        throw new EventServiceException("Event not found: " + eventId);
    } catch (FeignException ex) {
        throw new EventServiceException("Event Service unavailable");
    }
}
```
This is the **circuit-breaker pattern** at the application level. If event-manager is down, the user gets a clean error message instead of a Feign stack trace.

### 12.2 ExpenseServiceImpl

**Handles the complete expense lifecycle.**

#### `createExpense(String actorId, String eventId, ExpenseRequestDto request)`
```
Step 1: fetchEvent(eventId)              → Validate event exists
Step 2: Map DTO → Entity                 → Status = SUBMITTED, submittedBy = actorId
Step 3: expenseRepository.save(expense)  → Persist
Step 4: Audit + Notify                   → Log CREATE, notify "Expense submitted"
Step 5: Return ExpenseResponseDto
```

#### `updateExpenseStatus(String actorId, String expenseId, ExpenseStatus status)`
```
Step 1: Find expense                     → Throw ExpenseNotFoundException if not found
Step 2: Validate state transition        → Only SUBMITTED expenses can be APPROVED/REJECTED
                                           If current status != SUBMITTED → throw InvalidExpenseStateException
Step 3: Update status + approvedBy       → Set new status, record who approved/rejected
Step 4: Save + Audit                     → Persist changes, log APPROVE or REJECT action
Step 5: Return updated ExpenseResponseDto
```

**State validation logic:**
```java
if (expense.getStatus() != ExpenseStatus.SUBMITTED) {
    throw new InvalidExpenseStateException(expenseId, expense.getStatus(), status);
}
```
This prevents double-approval, approving a paid expense, etc.

#### `makePayment(String actorId, String expenseId, PaymentRequestDto request)`
This is the most complex operation — it touches THREE database tables:

```
Step 1: Find expense                     → Throw if not found
Step 2: Validate status == APPROVED      → Only APPROVED expenses can be paid
                                           If not APPROVED → throw InvalidExpenseStateException
Step 3: Create Payment entity            → Map DTO → Payment, set status = COMPLETED
Step 4: paymentRepository.save(payment)  → Persist payment record
Step 5: expense.setStatus(PAID)          → Update expense status to PAID
Step 6: expenseRepository.save(expense)  → Persist expense update
Step 7: Update Budget                    → Find budget by eventId
                                           budget.actualAmount += expense.amount
                                           budget.variance = planned - actual
                                           budgetRepository.save(budget)
Step 8: Audit + Notify                   → Log CREATE for payment, notify user
Step 9: Return PaymentResponseDto
```

#### `deleteExpense(String actorId, String expenseId)`
```
Step 1: Find expense                     → Throw if not found
Step 2: expenseRepository.delete(expense)→ Hard delete from database
Step 3: Audit                            → Log DELETE action
```

#### `getAllExpenses()` and `getExpensesByEvent(String eventId, Pageable pageable)`
- `getAllExpenses()` — Returns a flat list of ALL expenses across all events
- `getExpensesByEvent()` — Returns paginated expenses for a specific event (validates event exists first via Feign)

### 12.3 AuditServiceImpl

**Fire-and-forget audit logging.**

```java
public void logAudit(String userId, AuditAction action, String entityName, String entityId) {
    var dto = new AuditLogRequestDto(action, entityId, entityName);
    try {
        auditClient.createAudit(dto);
    } catch (FeignException e) {
        log.warn("Audit call rejected: status={}, body={}", e.status(), e.contentUTF8());
    } catch (Exception e) {
        log.warn("Audit call failed: error={}", e.getMessage());
    }
}
```

**Critical design principle:** Audit failures are NEVER propagated. If log-manager is down, the business operation (creating an expense, making a payment) still succeeds. Audit is a best-effort side-effect.

---

## 13. Controller Layer (REST Endpoints)

### 13.1 BudgetController

```java
@RestController
@RequestMapping("")
public class BudgetController {

    @PostMapping("/events/{eventId}/budget")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER', 'FINANCE_MANAGER')")
    public ResponseEntity<BudgetResponseDto> createBudget(
            @PathVariable String eventId,
            @Valid @RequestBody BudgetRequestDto request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        // ...
        return new ResponseEntity<>(response, HttpStatus.CREATED);  // 201
    }

    @GetMapping("/events/{eventId}/budget")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER', 'FINANCE_MANAGER')")
    public ResponseEntity<BudgetResponseDto> getBudget(
            @PathVariable String eventId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        // ...
        return ResponseEntity.ok(response);  // 200
    }
}
```

### 13.2 ExpenseController

| Method | URL | Role Required | Description |
|--------|-----|---------------|-------------|
| `GET` | `/expenses` | ADMIN, FINANCE_MANAGER | Get all expenses |
| `GET` | `/events/{eventId}/expenses` | ADMIN, ORGANIZER, FINANCE_MANAGER | Get expenses for event (paginated) |
| `POST` | `/events/{eventId}/expenses` | ADMIN, ORGANIZER, FINANCE_MANAGER | Create expense |
| `PATCH` | `/expenses/{expenseId}/status?status=APPROVED` | ADMIN, FINANCE_MANAGER | Approve/Reject |
| `POST` | `/expenses/{expenseId}/payment` | ADMIN, FINANCE_MANAGER | Make payment |
| `DELETE` | `/expenses/{expenseId}` | ADMIN, ORGANIZER | Delete expense |

### How URL routing works with API Gateway

The API Gateway route is configured as:
```
/api/v1/expense-manager/** → stripPrefix(3) → lb(EXPENSE-MANAGER)
```

So when a client calls:
```
GET http://localhost:6970/api/v1/expense-manager/events/EVT-123/expenses
```

The gateway strips `/api/v1/expense-manager` (3 segments) and forwards to:
```
GET http://expense-manager-host:7099/events/EVT-123/expenses
```

This is why `@RequestMapping("")` on the controllers — there's no prefix like `/api/v1` because the gateway already strips it.

---

## 14. Exception Handling

### Custom Exceptions

| Exception | HTTP Status | When thrown |
|-----------|-------------|------------|
| `BudgetNotFoundException` | 404 | Budget doesn't exist for the given eventId |
| `BudgetAlreadyExistsException` | 409 | Trying to create a second budget for the same event |
| `ExpenseNotFoundException` | 404 | Expense with given ID doesn't exist |
| `InvalidExpenseStateException` | 400 | Invalid status transition (e.g., approving a PAID expense) |
| `EventServiceException` | 404 or 503 | Event not found, or event-manager is unreachable |

### GlobalExceptionHandler (`@ControllerAdvice`)

This is a centralized exception handler. Instead of try-catch in every controller, Spring intercepts exceptions and routes them here:

```java
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(BudgetNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleBudgetNotFound(BudgetNotFoundException ex, HttpServletRequest request) {
        auditService.logAudit(resolveUserId(), resolveActionByMethod(request), "Budget", request.getRequestURI());
        return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    // ... similar handlers for each exception type
}
```

**Every exception handler also logs an audit entry** — so even failed operations are tracked.

### Response format

All error responses follow a consistent structure:
```json
{
    "timestamp": "2026-03-29T14:30:00",
    "status": 404,
    "error": "Not Found",
    "message": "Budget not found for eventId: EVT-123"
}
```

---

## 15. Security (Authentication & Authorization)

### How JWT authentication works end-to-end:

```
Client → sends request with header: Authorization: Bearer <jwt-token>
    │
    ▼
JwtAuthFilter (runs before every request)
    │
    ├── Extract token from "Authorization" header
    ├── Call IAMClient.validate(token)  → Feign call to auth-manager
    │       │
    │       ▼
    │   Auth Manager validates the JWT signature, expiry, etc.
    │   Returns: ValidateResponse { userId, email, role }
    │       │
    │       ▼
    ├── Build UserPrincipal(userId, email, role)
    ├── Create Authentication object with role as GrantedAuthority
    ├── Set in SecurityContextHolder
    │
    ▼
Controller receives @AuthenticationPrincipal UserPrincipal
    │
    ├── @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER')")
    │   Spring Security checks if the user's role matches
    │
    ▼
Request proceeds (or 403 Forbidden if role doesn't match)
```

### SecurityConfig

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(sm -> sm.sessionCreationPolicy(STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/health", "/swagger-ui/**", "/v3/api-docs/**").permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
```

**Key decisions:**
- **CSRF disabled** — This is a stateless REST API with JWT tokens, not a browser-form app. CSRF protection is unnecessary.
- **Session = STATELESS** — No HTTP sessions. Every request must carry its own JWT token.
- **Health check + Swagger are public** — No authentication needed for `/health` or API docs
- **Everything else requires authentication** — `anyRequest().authenticated()`
- **JwtAuthFilter runs before Spring's default auth filter** — This is where our custom JWT validation plugs in

### UserPrincipal

```java
public record UserPrincipal(String userId, String email, String role) {}
```

This is what `@AuthenticationPrincipal UserPrincipal userPrincipal` resolves to in controllers. It gives you the authenticated user's ID, email, and role extracted from the JWT.

---

## 16. Audit & Notification (Cross-Cutting Concerns)

### Audit Flow

```
Service method (e.g., createExpense)
    │
    ├── Business logic executes
    │
    ├── auditService.logAudit(userId, AuditAction.CREATE, Expense.class, expenseId)
    │       │
    │       ▼
    │   AuditServiceImpl
    │       │
    │       ├── Creates AuditLogRequestDto { action: CREATE, entityId: "exp-123", entityName: "Expense" }
    │       ├── Calls auditClient.createAudit(dto)  → Feign call to log-manager
    │       ├── If fails → log.warn() and continue (never throws)
    │       │
    │       ▼
    │   Log Manager receives and persists the audit record
    │
    ▼
Returns response to client (regardless of audit success/failure)
```

### Notification Flow

```
Service method (e.g., createBudget)
    │
    ├── Business logic executes
    │
    ├── notifyUser(userId, "Budget created for event EVT-123 with planned amount: 50000")
    │       │
    │       ▼
    │   logServiceClient.sendNotification(userId, message, "EXPENSE")
    │       │
    │       ├── POST /notifications/send?userId=xxx&message=yyy&category=EXPENSE
    │       ├── If fails → log.warn() and continue
    │       │
    │       ▼
    │   Log Manager stores notification and optionally sends to user
    │
    ▼
Returns response to client
```

### Where audit is triggered:

| Operation | Audit Action | Entity |
|-----------|-------------|--------|
| Create budget | CREATE | Budget |
| Get budget | READ | Budget |
| Create expense | CREATE | Expense |
| Get all expenses | READ | Expense |
| Get expenses by event | READ | Expense |
| Approve expense | APPROVE | Expense |
| Reject expense | REJECT | Expense |
| Make payment | CREATE | Payment |
| Delete expense | DELETE | Expense |
| Any exception | varies by HTTP method | varies |

---

## 17. Complete Request-Response Flow (End-to-End)

### Example: Creating an Expense

**Client sends:**
```http
POST http://localhost:6970/api/v1/expense-manager/events/EVT-123/expenses
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
Content-Type: application/json

{
    "description": "Catering charges",
    "amount": 15000.00,
    "date": "2026-03-29"
}
```

**Step-by-step execution:**

```
1. API GATEWAY (port 6970)
   ├── Receives: POST /api/v1/expense-manager/events/EVT-123/expenses
   ├── Matches route: /api/v1/expense-manager/**
   ├── Strips prefix: /api/v1/expense-manager → leaves /events/EVT-123/expenses
   ├── Load balances to EXPENSE-MANAGER via Eureka
   └── Forwards to: POST http://expense-manager:7099/events/EVT-123/expenses

2. JWT AUTH FILTER (JwtAuthFilter.java)
   ├── Extracts "Bearer eyJhbGci..." from Authorization header
   ├── Calls auth-manager: GET http://auth-manager:8081/auth/validate
   │   └── Auth-manager validates JWT signature, expiry
   │   └── Returns: { userId: "USR-456", email: "admin@eventsphere.com", role: "ADMIN" }
   ├── Creates UserPrincipal(userId="USR-456", email="admin@eventsphere.com", role="ADMIN")
   ├── Sets SecurityContext with role ROLE_ADMIN
   └── Passes request to next filter

3. SPRING SECURITY (@PreAuthorize)
   ├── Checks: hasAnyRole('ADMIN', 'ORGANIZER', 'FINANCE_MANAGER')
   ├── User has ROLE_ADMIN → ✅ Allowed
   └── Passes to controller

4. EXPENSE CONTROLLER (ExpenseController.java)
   ├── @Valid validates request body:
   │   ├── description: "Catering charges" → ✅ @NotBlank
   │   ├── amount: 15000.00 → ✅ @NotNull @Positive
   │   └── date: 2026-03-29 → ✅ @NotNull
   ├── Extracts actorId from UserPrincipal: "USR-456"
   ├── Extracts eventId from path: "EVT-123"
   └── Calls: expenseService.createExpense("USR-456", "EVT-123", requestDto)

5. EXPENSE SERVICE (ExpenseServiceImpl.java)
   ├── fetchEvent("EVT-123")
   │   ├── Calls event-manager: GET http://event-manager:7070/api/v1/events/EVT-123
   │   ├── Event-manager returns event details → ✅ Event exists
   │   └── (If 404 → throws EventServiceException("Event not found"))
   │
   ├── Maps DTO → Entity:
   │   ├── eventId = "EVT-123"
   │   ├── description = "Catering charges"
   │   ├── amount = 15000.00
   │   ├── date = 2026-03-29
   │   ├── status = SUBMITTED (default)
   │   └── submittedBy = "USR-456"
   │
   ├── expenseRepository.save(expense)
   │   └── Hibernate: INSERT INTO expenses (...) VALUES (...)
   │   └── Returns entity with generated expenseId: "EXP-789"
   │
   ├── auditService.logAudit("USR-456", CREATE, Expense.class, "EXP-789")
   │   └── Feign call to log-manager: POST /audits { action: CREATE, entityId: "EXP-789", entityName: "Expense" }
   │
   ├── notifyUser("USR-456", "Expense \"Catering charges\" submitted for event \"EVT-123\"")
   │   └── Feign call to log-manager: POST /notifications/send?userId=USR-456&message=...&category=EXPENSE
   │
   └── Returns: ExpenseResponseDto { expenseId: "EXP-789", status: SUBMITTED, ... }

6. CONTROLLER RETURNS
   └── ResponseEntity with status 201 CREATED

7. CLIENT RECEIVES:
   HTTP/1.1 201 Created
   {
       "expenseId": "EXP-789",
       "eventId": "EVT-123",
       "description": "Catering charges",
       "amount": 15000.00,
       "date": "2026-03-29",
       "status": "SUBMITTED",
       "submittedBy": "USR-456",
       "approvedBy": null,
       "createdAt": "2026-03-29T14:30:00",
       "updatedAt": "2026-03-29T14:30:00"
   }
```

### Example: Payment Flow (Most Complex)

```
POST /expenses/EXP-789/payment  { amount: 15000, method: "BANK_TRANSFER", paymentDate: "..." }

1. Find expense EXP-789                          → Found ✅
2. Check status == APPROVED                       → ✅ (was approved earlier)
3. Create Payment entity                          → paymentId: "PAY-001", status: COMPLETED
4. Save payment to payments table                 → INSERT INTO payments (...)
5. Update expense status → PAID                   → UPDATE expenses SET status='PAID' WHERE ...
6. Find budget for event EVT-123                  → Budget found with planned=50000, actual=0
7. Update budget:
   ├── actualAmount = 0 + 15000 = 15000
   └── variance = 50000 - 15000 = 35000          → UPDATE budgets SET actual_amount=15000, variance=35000
8. Audit: CREATE Payment PAY-001
9. Notify: "Payment of 15000 processed for expense Catering charges"
10. Return PaymentResponseDto
```

---

## 18. API Endpoint Summary

### Via API Gateway (port 6970):

| Method | Gateway URL | Direct URL | Description |
|--------|-----------|------------|-------------|
| `POST` | `/api/v1/expense-manager/events/{eventId}/budget` | `:7099/events/{eventId}/budget` | Create budget |
| `GET` | `/api/v1/expense-manager/events/{eventId}/budget` | `:7099/events/{eventId}/budget` | Get budget |
| `POST` | `/api/v1/expense-manager/events/{eventId}/expenses` | `:7099/events/{eventId}/expenses` | Create expense |
| `GET` | `/api/v1/expense-manager/events/{eventId}/expenses` | `:7099/events/{eventId}/expenses` | Get event expenses (paginated) |
| `GET` | `/api/v1/expense-manager/expenses` | `:7099/expenses` | Get all expenses |
| `PATCH` | `/api/v1/expense-manager/expenses/{id}/status?status=X` | `:7099/expenses/{id}/status?status=X` | Approve/Reject |
| `POST` | `/api/v1/expense-manager/expenses/{id}/payment` | `:7099/expenses/{id}/payment` | Make payment |
| `DELETE` | `/api/v1/expense-manager/expenses/{id}` | `:7099/expenses/{id}` | Delete expense |
| `GET` | `/api/v1/expense-manager/health` | `:7099/health` | Health check (no auth) |

### Total Files Written: 48 Java files

| Layer | Count | Files |
|-------|-------|-------|
| Entity + Enums | 6 | Budget, Expense, Payment, ExpenseStatus, PaymentMethod, PaymentStatus |
| Repository | 3 | BudgetRepository, ExpenseRepository, PaymentRepository |
| DTO (Request) | 3 | BudgetRequestDto, ExpenseRequestDto, PaymentRequestDto |
| DTO (Response) | 3 | BudgetResponseDto, ExpenseResponseDto, PaymentResponseDto |
| DTO (Mapper) | 6 | Request + Response mapper for each entity |
| DTO (Audit) | 2 | AuditAction, AuditLogRequestDto |
| Feign Clients | 4 | EventServiceClient, AuditClient, LogServiceClient, IAMClient |
| Client DTO | 1 | EventResponseDto |
| Service (Interface) | 3 | BudgetService, ExpenseService, AuditService |
| Service (Impl) | 3 | BudgetServiceImpl, ExpenseServiceImpl, AuditServiceImpl |
| Controller | 3 | BudgetController, ExpenseController, HealthCheckController |
| Exception | 6 | 5 custom exceptions + GlobalExceptionHandler |
| Security | 5 | SecurityConfig, JwtAuthFilter, AuthService, UserPrincipal, ValidateResponse |
| Config | 2 | application.yml, pom.xml |
| Entry Point | 1 | ExpenseManagerApplication |

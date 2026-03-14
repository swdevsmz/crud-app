# Data Model: User Signup Feature

**Date**: 2026-03-07  
**Feature**: 010-signup  
**Status**: Phase 1 Design

## Overview

This document defines the data entities, schemas, validation rules, and state transitions for the user signup feature. The system uses AWS Cognito as the primary authentication store, with local SQLite for user metadata/preferences only.

---

## Entities

### 1. User Account (Cognito-managed)

**Description**: Represents a registered user in the system, managed by AWS Cognito User Pool.

**Storage**: AWS Cognito User Pool (production), LocalStack Cognito (local development)

**Attributes**:

| Attribute        | Type      | Required | Description                                | Validation                               |
| ---------------- | --------- | -------- | ------------------------------------------ | ---------------------------------------- |
| `sub`            | UUID      | Yes      | Unique user identifier (Cognito-generated) | Auto-generated                           |
| `email`          | String    | Yes      | User's email address (unique)              | RFC 5322 format, max 254 chars           |
| `email_verified` | Boolean   | Yes      | Email verification status                  | Auto-managed by Cognito                  |
| `password`       | String    | Yes      | User's password (hashed by Cognito)        | Min 8 chars, mixed case, number, special |
| `created_at`     | Timestamp | Yes      | Account creation timestamp                 | Auto-generated (ISO 8601)                |
| `updated_at`     | Timestamp | Yes      | Last update timestamp                      | Auto-updated (ISO 8601)                  |

**Cognito Attributes**:

```json
{
  "Username": "user@example.com",
  "Attributes": [
    { "Name": "sub", "Value": "a1b2c3d4-e5f6-7890-abcd-ef1234567890" },
    { "Name": "email", "Value": "user@example.com" },
    { "Name": "email_verified", "Value": "true" }
  ],
  "UserStatus": "CONFIRMED",
  "UserCreateDate": "2026-03-07T10:30:00.000Z",
  "UserLastModifiedDate": "2026-03-07T10:35:00.000Z"
}
```

**States**:

- `UNCONFIRMED`: User signed up, email not verified
- `CONFIRMED`: Email verified, can sign in
- `FORCE_CHANGE_PASSWORD`: Password reset required (not used in signup)
- `RESET_REQUIRED`: Admin action required (not used in signup)

**State Transitions**:

```
[Initial] --SignUp--> UNCONFIRMED --ConfirmSignUp--> CONFIRMED
```

---

### 2. User Metadata (Local SQLite)

**Description**: User-specific metadata and preferences stored locally. This is separate from authentication data and used for application features (future: TODO items, preferences).

**Storage**: SQLite via Prisma ORM

**Prisma Schema**:

```prisma
model User {
  id              String   @id // Cognito sub (UUID)
  email           String   @unique
  emailVerified   Boolean  @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Future relations
  // todos Todo[]
  // preferences UserPreferences?

  @@map("users")
}
```

**Purpose**:

- Sync Cognito user data to local DB for querying
- Foundation for future features (TODOs, preferences)
- No authentication data stored (passwords managed by Cognito)

**Lifecycle**:

1. Created after successful email verification (CONFIRMED state)
2. Updated when user data changes
3. Not used for authentication (Cognito is source of truth)

---

### 3. Verification Token (Cognito-managed)

**Description**: Temporary verification code sent via email for account confirmation.

**Storage**: Managed internally by AWS Cognito (not directly accessible)

**Properties**:

- Auto-generated 6-digit code
- Sent to user's email upon signup
- Valid for 24 hours (Cognito default)
- Single-use (invalidated after successful confirmation)

**Flow**:

```
SignUp → Cognito generates code → Email sent → User enters code → ConfirmSignUp
```

**Note**: We do not create or manage tokens directly. Cognito handles generation, storage, expiration, and validation.

---

## Validation Rules

### Email Validation

**Rule**: Valid email format per RFC 5322

**Regex**:

```typescript
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
```

**Additional Checks**:

- Min length: 3 characters
- Max length: 254 characters
- No leading/trailing whitespace
- Case-insensitive (stored as lowercase)

**Error Messages**:

- `""` (empty): "Email address is required"
- Invalid format: "Please enter a valid email address"
- Already exists: "This email is already registered. Please log in or use a different email."

**Backend Validation** (NestJS DTO):

```typescript
export class SignupDto {
  @IsEmail({}, { message: "Please enter a valid email address" })
  @IsNotEmpty({ message: "Email address is required" })
  @MaxLength(254)
  @Transform(({ value }) => value.toLowerCase())
  email: string;
}
```

---

### Password Validation

**Rule**: Minimum 8 characters with mixed complexity (FR-003)

**Requirements**:

1. ✅ At least 8 characters
2. ✅ At least one uppercase letter (A-Z)
3. ✅ At least one lowercase letter (a-z)
4. ✅ At least one number (0-9)
5. ✅ At least one special character (!@#$%^&\*()\_+-=[]{}|;:,.<>?)
6. ✅ Maximum 128 characters (security)

**Regex**:

```typescript
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]).{8,128}$/;
```

**Error Messages**:

- `""` (empty): "Password is required"
- Too short: "Password must be at least 8 characters"
- Missing uppercase: "Password must include at least one uppercase letter"
- Missing lowercase: "Password must include at least one lowercase letter"
- Missing number: "Password must include at least one number"
- Missing special: "Password must include at least one special character"
- Too long: "Password must not exceed 128 characters"

**Backend Validation** (NestJS DTO):

```typescript
export class SignupDto {
  @Matches(PASSWORD_REGEX, {
    message:
      "Password must be at least 8 characters and include uppercase, lowercase, number, and special character",
  })
  @IsNotEmpty({ message: "Password is required" })
  @MinLength(8)
  @MaxLength(128)
  password: string;
}
```

**Frontend Validation** (Real-time checklist for US-002):

```typescript
{
  length: password.length >= 8,
  uppercase: /[A-Z]/.test(password),
  lowercase: /[a-z]/.test(password),
  number: /\d/.test(password),
  special: /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)
}
```

---

### Password Confirmation Validation

**Rule**: Must exactly match password field (FR-004)

**Validation**:

```typescript
passwordConfirm === password;
```

**Error Messages**:

- `""` (empty): "Please confirm your password"
- Mismatch: "Passwords do not match"

**Backend Validation**:

```typescript
export class SignupDto {
  @IsNotEmpty({ message: "Please confirm your password" })
  passwordConfirm: string;

  @ValidateIf((o) => o.password !== o.passwordConfirm)
  @IsEmpty({ message: "Passwords do not match" })
  passwordMismatch?: string;
}
```

---

## State Transitions

### Signup Flow State Machine

```
┌─────────────┐
│   Initial   │
│  (No User)  │
└──────┬──────┘
       │
       │ POST /auth/signup
       │ (email, password)
       ▼
┌─────────────────┐
│  UNCONFIRMED    │◄── Cognito generates verification code
│  (User created) │    Email sent to user
└──────┬──────────┘
       │
       │ GET /auth/verify?email=...&code=...
       │ (user clicks email link)
       ▼
┌─────────────────┐
│   CONFIRMED     │◄── Email verified
│ (User verified) │    Auto-login tokens issued
└──────┬──────────┘
       │
       │ Automatic redirect
       ▼
┌─────────────────┐
│  Authenticated  │
│  (Dashboard)    │
└─────────────────┘
```

**State Details**:

1. **Initial → UNCONFIRMED**
   - Trigger: Valid signup form submission
   - Action: Cognito `SignUp` API call
   - Result: User created in UNCONFIRMED state, verification email sent
   - Frontend: Show "Check your email" message

2. **UNCONFIRMED → CONFIRMED**
   - Trigger: User clicks verification link with valid code
   - Action: Cognito `ConfirmSignUp` API call
   - Result: Email marked as verified, user can now sign in
   - Frontend: Auto-login and redirect to dashboard

3. **Error States** (handled, not persisted):
   - **Duplicate Email**: Return 409 Conflict, don't create user
   - **Invalid Code**: Return 400 Bad Request, user can retry
   - **Expired Code**: Return 410 Gone, user must request new code (future feature)
   - **Network Failure**: Return 503 Service Unavailable, user retries

---

## Data Flow Diagrams

### Signup Data Flow

```
[Frontend]              [Backend]               [AWS Cognito]        [Email Service]
    │                       │                         │                     │
    │ POST /auth/signup    │                         │                     │
    ├──────────────────────►│                         │                     │
    │                       │ Validate DTO            │                     │
    │                       │ (email, password)       │                     │
    │                       │                         │                     │
    │                       │ SignUp(email, password) │                     │
    │                       ├────────────────────────►│                     │
    │                       │                         │ Generate code       │
    │                       │                         │ Send email          │
    │                       │                         ├────────────────────►│
    │                       │                         │                     │
    │                       │◄────────────────────────┤                     │
    │                       │ { userSub, status }     │                     │
    │◄──────────────────────┤                         │                     │
    │ 201 Created           │                         │                     │
    │ { message, email }    │                         │                     │
    │                       │                         │                     │
```

### Email Verification Data Flow

```
[Frontend]              [Backend]               [AWS Cognito]        [SQLite DB]
    │                       │                         │                     │
    │ GET /auth/verify      │                         │                     │
    │ ?email=...&code=...   │                         │                     │
    ├──────────────────────►│                         │                     │
    │                       │ ConfirmSignUp(code)     │                     │
    │                       ├────────────────────────►│                     │
    │                       │◄────────────────────────┤                     │
    │                       │ Success                 │                     │
    │                       │                         │                     │
    │                       │ InitiateAuth(email, pw) │                     │
    │                       ├────────────────────────►│                     │
    │                       │◄────────────────────────┤                     │
    │                       │ { accessToken, idToken }│                     │
    │                       │                         │                     │
    │                       │ Create user metadata    │                     │
    │                       ├─────────────────────────┼────────────────────►│
    │                       │                         │                     │
    │◄──────────────────────┤                         │                     │
    │ 200 OK                │                         │                     │
    │ { tokens, redirect }  │                         │                     │
    │                       │                         │                     │
```

---

## Database Schema (Prisma)

### Complete Schema for MVP

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id            String   @id // Cognito sub UUID
  email         String   @unique
  emailVerified Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@map("users")
}

// Future models (not implemented in this feature):
// model Todo { ... }
// model UserPreferences { ... }
```

### Migration Strategy

**Initial Migration**:

```bash
npx prisma migrate dev --name init_user_table
```

**Seed Data** (for local testing):

```typescript
// prisma/seed.ts
const testUser = await prisma.user.create({
  data: {
    id: "test-uuid-1234",
    email: "test@example.com",
    emailVerified: true,
  },
});
```

---

## Validation Timing

### Frontend Validation (Real-time)

| Field            | Trigger               | Delay          | Feedback                  |
| ---------------- | --------------------- | -------------- | ------------------------- |
| Email            | `onChange` + `onBlur` | 300ms debounce | Inline error below field  |
| Password         | `onChange`            | Instant        | Checklist of requirements |
| Password Confirm | `onChange`            | Instant        | Inline error if mismatch  |

**Show Errors After**:

- First `onBlur` (user leaves field)
- Form submission attempt
- Never show errors while user is actively typing (unless already shown)

**Clear Errors When**:

- Field value changes and becomes valid
- User starts correcting the field

---

### Backend Validation (Submission)

**Validation Pipeline**:

```
HTTP Request
    ↓
NestJS Validation Pipe (class-validator)
    ↓
DTO validation (SignupDto)
    ↓
Custom business logic (duplicate check)
    ↓
Cognito API call
    ↓
Response or Error
```

**Validation Errors Return**:

```json
{
  "statusCode": 400,
  "message": ["Email must be a valid email address", "Password is too weak"],
  "error": "Bad Request"
}
```

---

## Summary

**Entities**:

1. User Account (Cognito) - authentication data
2. User Metadata (SQLite) - application data
3. Verification Token (Cognito-managed) - email confirmation

**Key Validation Rules**:

- Email: RFC 5322 format, unique, max 254 chars
- Password: 8-128 chars, mixed complexity
- Password Confirm: Exact match

**State Flow**:

- Initial → UNCONFIRMED (signup) → CONFIRMED (verify) → Authenticated

**Data Storage**:

- Auth data: Cognito (source of truth)
- Metadata: SQLite (synced from Cognito)
- No passwords stored locally

**Next**: Proceed to API contracts definition (`contracts/signup-api.yaml`)

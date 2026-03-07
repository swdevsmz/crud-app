# Research: User Signup Feature

**Date**: 2026-03-07  
**Feature**: 010-signup  
**Status**: Phase 0 Complete

## Purpose

Resolve all "NEEDS CLARIFICATION" items from Technical Context and document technology decisions, best practices, and integration patterns for the signup feature.

---

## Research Tasks

### 1. E2E Testing Framework Selection

**Question**: Playwright or Cypress for E2E testing?

**Research**:

- **Playwright**: Modern, cross-browser (Chromium, Firefox, WebKit), better performance, built-in parallel execution, TypeScript-first
- **Cypress**: More mature ecosystem, easier debugging UI, better documentation, simpler setup

**Decision**: **Playwright**

**Rationale**:

1. TypeScript-first aligns with project's strict TypeScript requirement
2. Cross-browser testing important for MVP acceptance criteria (SC-007: 320px-1920px viewports)
3. Parallel execution reduces CI time (cost-conscious)
4. Better API for testing email verification flow (wait for network, handle redirects)
5. Native support for testing in different viewport sizes
6. Modern tool with active development from Microsoft

**Alternatives Considered**:

- Cypress: Rejected due to heavier resource usage and challenging cross-browser support
- Selenium: Rejected due to complexity and maintenance burden for small project

---

### 2. AWS Cognito Integration Best Practices

**Question**: How to integrate Cognito with NestJS for signup and email verification?

**Research**:

- AWS SDK v3 modular packages: `@aws-sdk/client-cognito-identity-provider`
- LocalStack supports Cognito User Pools for local development
- Best practices:
  - Use environment variables for User Pool ID and Client ID
  - Implement retry logic for AWS SDK calls
  - Use NestJS ConfigService for configuration management
  - Separate concerns: CognitoService for AWS operations, AuthService for business logic

**Decision**: Use NestJS ConfigModule + AWS SDK v3 + LocalStack

**Technology Stack**:

```typescript
// Backend packages
@aws-sdk/client-cognito-identity-provider  // Cognito operations
@nestjs/config                             // Environment config
class-validator                            // DTO validation
class-transformer                          // DTO transformation
```

**Rationale**:

1. AWS SDK v3 is tree-shakeable (smaller Lambda bundle size)
2. NestJS ConfigModule provides type-safe configuration
3. LocalStack provides local Cognito without AWS costs
4. Separation of concerns improves testability

**Integration Pattern**:

```
AuthController → AuthService → CognitoService → AWS Cognito
                      ↓
                DTO Validation
```

---

### 3. Password Validation Rules

**Question**: What are industry-standard password requirements that balance security and usability?

**Research**:

- NIST SP 800-63B guidelines (2023):
  - Minimum 8 characters (recommended 12+)
  - No composition requirements (uppercase/lowercase/number/special) if using passphrase
  - Check against common password lists
  - Allow all printable ASCII + spaces
- OWASP recommendations:
  - Minimum 8 characters for general applications
  - At least one uppercase, lowercase, number, special character
  - No maximum length restrictions (up to 128 chars)

**Decision**: Follow spec requirements (FR-003) + OWASP baseline

**Requirements**:

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (!@#$%^&\*()\_+-=[]{}|;:,.<>?)
- Maximum 128 characters (prevent buffer overflow)

**Rationale**:

1. Spec already defines clear requirements (FR-003)
2. Cognito enforces password policies - align with spec
3. Provides good security baseline for learning project
4. Clear user feedback for each requirement (FR-003, US-002)

**Implementation**:

- Backend: NestJS class-validator custom decorator
- Frontend: Real-time validation hook showing requirements checklist

---

### 4. Email Verification Flow Pattern

**Question**: How should email verification work with Cognito, including token handling and auto-login?

**Research**:

- Cognito email verification flow:
  1. `SignUp` API creates user in UNCONFIRMED state
  2. Cognito sends email with verification code
  3. `ConfirmSignUp` API with code confirms user
  4. User can then `InitiateAuth` to sign in
- Alternative: Custom verification link with Lambda trigger
- Auto-login after verification requires:
  - Generating auth tokens after confirmation
  - Secure token transmission to frontend
  - Redirect with token in URL or API call

**Decision**: Cognito built-in verification + auto-login via API endpoint

**Flow**:

```
1. POST /auth/signup → Cognito SignUp → email sent
2. User clicks link → GET /auth/verify?email={email}&code={code}
3. Backend: ConfirmSignUp + InitiateAuth
4. Return: { accessToken, refreshToken, redirectUrl: "/dashboard" }
5. Frontend: Store tokens → redirect to dashboard
```

**Rationale**:

1. Uses Cognito's built-in verification (no custom Lambda needed - cost-conscious)
2. Auto-login meets FR-017 requirement
3. Secure token handling (tokens in response body, not URL)
4. Stateless verification (code in URL enables email client preview)

**Alternatives Considered**:

- Custom Lambda for verification: Rejected due to added complexity and cost
- Manual login after verification: Rejected per clarification (auto-login required)

---

### 5. LocalStack Setup for Cognito Development

**Question**: How to configure LocalStack to simulate Cognito for local development?

**Research**:

- LocalStack Community Edition supports Cognito User Pools (free)
- Configuration via docker-compose or Podman Compose
- Requires SERVICES=cognito environment variable
- Use localhost:4566 as endpoint override in AWS SDK

**Decision**: Podman Compose + LocalStack with Cognito service

**Configuration**:

```yaml
# compose.yaml
services:
  localstack:
    image: localstack/localstack:latest
    environment:
      - SERVICES=cognito
      - DEFAULT_REGION=us-east-1
    ports:
      - "4566:4566"
    volumes:
      - ./localstack-data:/var/lib/localstack
```

**Environment Variables**:

```bash
# .env.local
COGNITO_ENDPOINT=http://localhost:4566
COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxx
AWS_REGION=us-east-1
```

**Rationale**:

1. Free tier - no AWS costs during development
2. Fast iteration - no network latency
3. Repeatable - same config across team
4. Matches production behavior (Cognito API compatibility)

---

### 6. Form Validation Strategy (Frontend)

**Question**: How to implement real-time validation that meets FR-002 to FR-004 and US-002?

**Research**:

- React patterns:
  - Controlled components with onChange validation
  - Custom hooks for validation logic
  - Debouncing for performance (prevent validation on every keystroke)
  - Validation libraries: Zod, Yup, custom
- Performance considerations:
  - 500ms debounce for email validation (API call)
  - Immediate validation for password (local regex)
  - Show errors only after blur or first submit attempt

**Decision**: Custom validation hook + debouncing + progressive disclosure

**Pattern**:

```typescript
const { values, errors, validate, handleChange, handleBlur } =
  useFormValidation({
    initialValues: { email: "", password: "", passwordConfirm: "" },
    validators: {
      email: emailValidator,
      password: passwordStrengthValidator,
      passwordConfirm: passwordMatchValidator,
    },
    debounceMs: { email: 300, password: 0, passwordConfirm: 0 },
  });
```

**Validation Rules**:

- Email: RFC 5322 regex + format check (instant), domain MX lookup (debounced 300ms)
- Password: Strength requirements (instant)
- Password Confirm: Match check (instant)
- Show errors: After first blur or submit attempt
- Clear errors: When field value changes and becomes valid

**Rationale**:

1. Custom hook keeps components clean and testable
2. Debouncing prevents performance issues (SC-004: <500ms)
3. Progressive disclosure reduces user frustration (show errors only when relevant)
4. No external library dependency (simpler, lighter bundle)

**Alternatives Considered**:

- Zod schema validation: Rejected (overkill for 3 fields, bundle size)
- Formik: Rejected (adds complexity, not needed for single form)

---

### 7. State Management for Auth

**Question**: How to manage authentication state with Jotai?

**Research**:

- Jotai atoms for fine-grained reactivity
- Patterns:
  - Primitive atoms for simple state (isAuthenticated, user)
  - Derived atoms for computed values (isEmailVerified)
  - Async atoms for API calls (optional, prefer hooks)
  - Atom persistence with localStorage

**Decision**: Primitive atoms + localStorage persistence for auth state

**Atom Structure**:

```typescript
// auth-store.ts
export const authTokenAtom = atomWithStorage<string | null>("authToken", null);
export const userAtom = atomWithStorage<User | null>("user", null);
export const isAuthenticatedAtom = atom((get) => get(authTokenAtom) !== null);
```

**Rationale**:

1. Simple and predictable state updates
2. localStorage persistence survives page refresh
3. Derived atoms prevent state inconsistencies
4. No middleware complexity (MobX, Redux)
5. Aligns with project requirement (Section 3: Jotai for state management)

---

### 8. Error Handling Strategy

**Question**: How to handle and display errors for FR-010 (clear, actionable error messages)?

**Research**:

- Backend error types:
  - Validation errors (400) - field-specific
  - Business logic errors (409) - duplicate account
  - AWS errors (500/503) - service unavailable
  - Network errors (timeouts, connection refused)
- Frontend patterns:
  - Toast notifications for system errors
  - Inline field errors for validation
  - Form-level error for submission failures
  - Loading states during async operations

**Decision**: Layered error handling with NestJS exception filters + frontend error boundary

**Backend Pattern**:

```typescript
// NestJS Exception Filter
- ValidationException → 400 with field errors
- ConflictException → 409 with user-friendly message
- CognitoException → map to user-friendly errors
- UnknownException → 500 generic message (don't leak details)
```

**Frontend Pattern**:

```typescript
- Field errors: <FormField error={errors.email} />
- Submission errors: <Alert type="error" message={submitError} />
- Network errors: "Connection failed. Check your internet."
- Service errors: "Service temporarily unavailable. Try again later."
```

**User-Friendly Error Messages** (FR-010 compliance):

- "This email is already registered. Please log in or use a different email."
- "Connection failed. Please check your internet connection and try again."
- "Service temporarily unavailable. Please try again in a few minutes."
- "Password must be at least 8 characters with uppercase, lowercase, number, and special character."

**Rationale**:

1. Users never see technical errors (security + UX)
2. Actionable messages tell users what to do next
3. Consistent error format across endpoints
4. Meets FR-010 requirement explicitly

---

### 9. AWS SES Email Verification Limits

**Question**: What are SES free tier limits and how to stay within them?

**Research**:

- AWS SES Free Tier:
  - 62,000 emails per month when sending from EC2
  - 3,000 emails per month when sending from other sources (Lambda)
  - $0.10 per 1,000 emails after free tier
- SES Sandbox restrictions:
  - Must verify sender and recipient email addresses
  - Limited to 200 emails per 24 hours
  - Must request production access to remove limits
- Cognito integration:
  - Cognito uses SES for email delivery (if configured)
  - Default: Cognito's built-in email (50 emails/day limit)
  - Custom: SES integration (higher limits)

**Decision**: Use Cognito default email for MVP, document SES setup for production

**MVP Approach**:

- Use Cognito's built-in email service (50 emails/day)
- Sufficient for learning project (SC: <1000 signups/month ≈ 33/day)
- No SES configuration needed
- Zero cost

**Production Path** (documented, not implemented):

```
1. Verify domain in SES
2. Configure Cognito User Pool to use SES
3. Request production access (remove sandbox)
4. Monitor usage to stay in free tier
```

**Rationale**:

1. Free - no SES costs for MVP
2. Simple - no additional AWS service setup
3. Sufficient - 50 emails/day exceeds expected usage
4. Scalable - documented upgrade path when needed

**Resolution**: Constitution Check item "NEEDS VERIFICATION: Email verification via SES" → ✅ Resolved: Use Cognito default email (free, 50/day limit sufficient for MVP)

---

### 10. Testing Strategy

**Question**: How to structure tests to meet 70% coverage target (Section 11)?

**Research**:

- Test pyramid: Unit > Integration > E2E
- Coverage areas:
  - Frontend: Component tests (React Testing Library), integration tests (user flows)
  - Backend: Service tests (business logic), controller tests (API contracts), E2E tests (Supertest)
  - E2E: Critical paths (signup flow, email verification)
- Coverage targets:
  - Unit tests: 80% (fast, isolated)
  - Integration tests: key flows (signup success, validation errors)
  - E2E tests: happy path + critical errors

**Decision**: Test pyramid with focus on service/component unit tests

**Test Distribution**:

```
Frontend:
- Unit: signup-form.test.tsx, password-input.test.tsx, validation.test.ts
- Integration: signup-flow.test.tsx (form submission, error handling)
- E2E: signup.spec.ts (full flow in Playwright)

Backend:
- Unit: cognito.service.test.ts, auth.service.test.ts, dto validation tests
- Integration: auth.controller.test.ts (API endpoints)
- E2E: signup.e2e.spec.ts (Supertest, full flow with LocalStack)
```

**Coverage Priority**:

1. Validation logic (password rules, email format) - HIGH
2. Cognito service (signup, verify) - HIGH
3. Error handling paths - MEDIUM
4. UI components - MEDIUM
5. Happy path E2E - MEDIUM

**Rationale**:

1. Unit tests are fast and catch most bugs
2. Integration tests verify component interaction
3. E2E tests ensure critical paths work end-to-end
4. Prioritization focuses on high-risk areas (validation, external service)

**Tools**:

- Frontend: Vitest (fast, Vite-native), React Testing Library (user-centric)
- Backend: Jest (industry standard), Supertest (API testing)
- E2E: Playwright (cross-browser, modern)

---

## Summary of Decisions

| Category            | Decision                              | Rationale                                    |
| ------------------- | ------------------------------------- | -------------------------------------------- |
| E2E Testing         | Playwright                            | TypeScript-first, cross-browser, performance |
| Cognito Integration | AWS SDK v3 + LocalStack               | Tree-shakeable, cost-free local dev          |
| Password Rules      | 8+ chars, mixed case, number, special | Spec requirement + OWASP baseline            |
| Email Verification  | Cognito built-in + auto-login         | Simple, cost-effective, meets FR-017         |
| LocalStack Setup    | Podman Compose + Cognito              | Free, repeatable, matches production         |
| Form Validation     | Custom hook + debouncing              | Lightweight, performant, no lib dependency   |
| State Management    | Jotai atoms + localStorage            | Simple, project requirement, persistent      |
| Error Handling      | Exception filter + inline errors      | User-friendly, secure, meets FR-010          |
| Email Service       | Cognito default (not SES)             | Free, 50/day sufficient for MVP              |
| Testing Strategy    | Pyramid (Unit > Integration > E2E)    | Balanced coverage, fast feedback             |

**All NEEDS CLARIFICATION items resolved.** ✅

---

## Next Steps

Proceed to **Phase 1**:

1. Create `data-model.md` (entities, validation, state transitions)
2. Create `contracts/signup-api.yaml` (OpenAPI specification)
3. Create `quickstart.md` (setup and testing guide)
4. Update agent context (run `.specify/scripts/bash/update-agent-context.sh copilot`)

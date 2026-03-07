# Implementation Plan: User Signup

**Branch**: `010-signup` | **Date**: 2026-03-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/workspaces/crud-app/specs/010-signup/spec.md`

## Summary

Implement a complete user signup flow with email/password registration, real-time form validation, and email verification. Users will be able to create accounts through AWS Cognito (LocalStack for local development), with automatic login and redirect to the TOP menu screen upon successful email verification. The implementation follows a dual-endpoint strategy supporting both local development (NestJS HTTP server) and production deployment (AWS Lambda + API Gateway).

## Technical Context

**Language/Version**: TypeScript strict mode (Frontend: React, Backend: NestJS)  
**Primary Dependencies**:

- Frontend: React 18+, Vite 5+, Jotai (state), Tailwind CSS (UI), axios (HTTP), React Router (routing)
- Backend: NestJS 10+, @nestjs/swagger (API docs), class-validator/class-transformer (validation)
- Auth: AWS SDK v3 Cognito client, LocalStack (local dev)
- ORM: Prisma 5+ (SQLite)
  **Storage**:
- Local dev: Persistent SQLite file
- Lambda: `/tmp` SQLite (volatile, learning mode - NOT production-persistent)
- Auth data: AWS Cognito User Pool (or LocalStack equivalent)
  **Testing**:
- Frontend: Vitest + React Testing Library
- Backend: Jest + Supertest
- E2E: Playwright (cross-browser, TypeScript-first)
  **Target Platform**:
- Frontend: Modern browsers (Chrome/Firefox/Safari latest 2 versions), responsive 320px-1920px
- Backend: AWS Lambda (Node.js 20 runtime) + API Gateway, local NestJS HTTP server (dev)
  **Project Type**: Full-stack web application (SPA + serverless API)  
  **Performance Goals**:
- Page load: <2s (TTI)
- Form validation: <500ms response
- API response: <1s (signup endpoint)
- Email delivery: <30s
  **Constraints**:
- AWS free tier only (Lambda, Cognito, SES)
- Dual endpoint strategy: `src/main.ts` (local) + `src/lambda.ts` (Lambda)
- No direct password storage (Cognito manages)
- Cost-conscious: minimize Lambda memory/timeout, prefer TOTP over SMS
  **Scale/Scope**:
- MVP: single signup flow
- Expected users: <1000 signups/month (learning project)
- Code: ~10-15 components (frontend), 3-5 modules (backend)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

Based on `.github/copilot-instructions.md` principles:

### ✅ Spec-First Workflow (Section 8)

- [x] `spec.md` exists and clarifications resolved
- [x] Plan created before implementation
- [x] Will create `tasks.md` before coding starts

### ✅ Dual Endpoint Strategy (Section 6)

- [x] Will implement `src/main.ts` for local dev
- [x] Will implement `src/lambda.ts` for Lambda runtime
- [x] Environment-based behavior switching planned

### ✅ Security Basics (Section 12)

- [x] No credential hardcoding - using environment variables
- [x] Input validation via NestJS DTO + class-validator
- [x] Auth guards planned for protected endpoints
- [x] Cognito manages password hashing (not stored locally)

### ✅ Quality Gates (Section 11)

- [x] Plan includes lint, type-check, unit tests, build
- [x] Target: 70% coverage for MVP

### ✅ Cost Consciousness (Section 4)

- [x] AWS free tier prioritized
- [x] LocalStack for local Cognito
- [x] Lambda memory/timeout minimized
- [x] Email verification: Cognito default email (50/day, sufficient for MVP - verified in research.md)

### ✅ Coding Standards (Section 7)

- [x] TypeScript strict mode
- [x] kebab-case file names
- [x] Explicit types for DTOs/interfaces
- [x] React function components
- [x] NestJS module/service/controller separation

**Gate Status**: ✅ PASS (all items verified)

No complexity violations detected - this is a standard CRUD feature following established patterns.

## Project Structure

### Documentation (this feature)

```text
specs/010-signup/
├── spec.md              # Feature specification (existing)
├── plan.md              # This file
├── research.md          # Phase 0: Technology decisions & best practices
├── data-model.md        # Phase 1: Entities, schemas, validation rules
├── quickstart.md        # Phase 1: Setup & testing guide
├── contracts/           # Phase 1: API contracts
│   └── signup-api.yaml  # OpenAPI spec for signup endpoints
└── tasks.md             # Phase 2: Implementation tasks (via /speckit.tasks)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── auth/                      # Authentication module (NEW)
│   │   ├── auth.module.ts
│   │   ├── cognito.service.ts     # Cognito integration
│   │   ├── dto/
│   │   │   ├── signup.dto.ts      # Signup request validation
│   │   │   └── verify-email.dto.ts
│   │   └── auth.controller.ts     # Signup/verify endpoints
│   ├── common/
│   │   ├── guards/                # Auth guards (future)
│   │   └── interceptors/          # Error handling
│   ├── config/                    # Environment config
│   │   └── cognito.config.ts      # Cognito settings
│   ├── main.ts                    # Local HTTP server
│   └── lambda.ts                  # Lambda handler
├── prisma/
│   └── schema.prisma              # User metadata schema
├── tests/
│   ├── unit/
│   │   └── auth/                  # Auth service tests
│   ├── integration/
│   │   └── signup.e2e.spec.ts     # Signup flow test
│   └── contract/                  # API contract tests
└── package.json

frontend/
├── src/
│   ├── components/
│   │   ├── auth/                  # Auth-related components (NEW)
│   │   │   ├── signup-form.tsx    # Main signup component
│   │   │   ├── password-input.tsx # Password with toggle
│   │   │   ├── form-field.tsx     # Reusable form field
│   │   │   └── verification-success.tsx
│   │   └── common/
│   │       └── loading-spinner.tsx
│   ├── pages/
│   │   ├── signup.tsx             # Signup page (NEW)
│   │   └── verify-email.tsx       # Email verification page (NEW)
│   ├── services/
│   │   └── auth-service.ts        # API calls for auth
│   ├── hooks/
│   │   ├── use-signup.ts          # Signup logic hook
│   │   └── use-form-validation.ts # Form validation hook
│   ├── store/
│   │   └── auth-store.ts          # Jotai auth state
│   ├── types/
│   │   └── auth.types.ts          # TypeScript interfaces
│   └── utils/
│       └── validation.ts          # Validation helpers
├── tests/
│   ├── unit/
│   │   └── components/auth/
│   └── integration/
│       └── signup-flow.spec.tsx
└── package.json

infrastructure/ (for future Terraform setup)
└── modules/
    └── cognito/
        └── main.tf                # Cognito User Pool config

.env.example                       # Environment template
.env.local                         # Local config (gitignored)
```

**Structure Decision**: Web application structure selected because:

- Clear separation between frontend (React SPA) and backend (NestJS API)
- Supports dual deployment: local dev server + Lambda deployment
- Follows NestJS module pattern (auth module per feature)
- React component organization by feature (auth/) and type (common/)
- Infrastructure as code (Terraform) kept separate for deployment concerns

## Complexity Tracking

No violations detected. This feature follows standard patterns:

- Standard web application structure (frontend + backend)
- NestJS module-per-feature pattern (auth module)
- AWS Cognito for authentication (managed service, no custom crypto)
- SQLite for metadata only (user preferences, not auth data)

---

## Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React SPA)                     │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Signup Page │  │ Verify Page  │  │ Dashboard (future)   │  │
│  └──────┬──────┘  └──────┬───────┘  └──────────────────────┘  │
│         │                 │                                      │
│  ┌──────▼─────────────────▼──────────────┐                     │
│  │      Jotai State (auth store)         │                     │
│  └──────┬────────────────────────────────┘                     │
│         │                                                        │
│  ┌──────▼────────────────────────────────┐                     │
│  │   axios (HTTP client)                 │                     │
│  └──────┬────────────────────────────────┘                     │
└─────────┼────────────────────────────────────────────────────┘
          │ HTTP/REST
          │
┌─────────▼────────────────────────────────────────────────────┐
│              Backend (NestJS API)                             │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │               Auth Controller                            │ │
│  │   POST /api/auth/signup  │  GET /api/auth/verify        │ │
│  └──────────┬────────────────┴─────────┬───────────────────┘ │
│             │                           │                      │
│  ┌──────────▼───────────────────────────▼──────────────────┐ │
│  │              Auth Service (business logic)              │ │
│  └──────────┬────────────────────────────┬─────────────────┘ │
│             │                             │                   │
│  ┌──────────▼──────────┐    ┌────────────▼────────────────┐ │
│  │  Cognito Service    │    │   Prisma Service           │ │
│  │  (AWS SDK v3)       │    │   (User metadata)          │ │
│  └──────────┬──────────┘    └────────────┬────────────────┘ │
└─────────────┼──────────────────────────────┼─────────────────┘
              │                              │
    ┌─────────▼──────────┐        ┌─────────▼─────────┐
    │  AWS Cognito       │        │  SQLite Database  │
    │  (or LocalStack)   │        │  (user metadata)  │
    └─────────┬──────────┘        └───────────────────┘
              │
    ┌─────────▼──────────┐
    │   Email Service    │
    │ (Cognito default)  │
    └────────────────────┘
```

### Authentication Flow

```
User                Frontend           Backend (NestJS)      AWS Cognito       Email
 │                      │                     │                    │             │
 │  1. Visit /signup   │                     │                    │             │
 ├────────────────────►│                     │                    │             │
 │                     │                     │                    │             │
 │  2. Fill form       │                     │                    │             │
 │  3. Submit          │                     │                    │             │
 ├────────────────────►│                     │                    │             │
 │                     │  POST /auth/signup  │                    │             │
 │                     ├────────────────────►│                    │             │
 │                     │                     │  SignUp()          │             │
 │                     │                     ├───────────────────►│             │
 │                     │                     │                    │ Send email  │
 │                     │                     │                    ├────────────►│
 │                     │                     │◄───────────────────┤             │
 │                     │◄────────────────────┤ User created       │             │
 │◄────────────────────┤ Show success msg    │ (UNCONFIRMED)      │             │
 │  "Check email"      │                     │                    │             │
 │                     │                     │                    │             │
 │  4. Check email     │                     │                    │             │
 │◄────────────────────┼─────────────────────┼────────────────────┼─────────────┤
 │  5. Click link      │                     │                    │             │
 │  /verify?code=...   │                     │                    │             │
 ├────────────────────►│                     │                    │             │
 │                     │  GET /auth/verify   │                    │             │
 │                     ├────────────────────►│                    │             │
 │                     │                     │  ConfirmSignUp()   │             │
 │                     │                     ├───────────────────►│             │
 │                     │                     │◄───────────────────┤             │
 │                     │                     │  User CONFIRMED    │             │
 │                     │                     │                    │             │
 │                     │                     │  InitiateAuth()    │             │
 │                     │                     ├───────────────────►│             │
 │                     │                     │◄───────────────────┤             │
 │                     │◄────────────────────┤  Tokens            │             │
 │◄────────────────────┤ Store tokens        │                    │             │
 │  Auto-login         │ Redirect /dashboard │                    │             │
 │  → /dashboard       │                     │                    │             │
```

### Component Breakdown

**Frontend Components**:

1. **SignupForm**: Main form with email, password, passwordConfirm fields
2. **PasswordInput**: Password field with show/hide toggle
3. **FormField**: Reusable input with label, error display
4. **VerificationSuccess**: Success message component after verification
5. **LoadingSpinner**: Loading indicator during API calls

**Backend Modules**:

1. **AuthModule**: Main authentication module
2. **CognitoService**: AWS Cognito integration (SignUp, ConfirmSignUp, InitiateAuth)
3. **AuthService**: Business logic layer
4. **AuthController**: HTTP endpoints (signup, verify)
5. **ConfigModule**: Environment configuration

---

## Implementation Phases

### Phase 0: Research & Planning ✅ COMPLETE

**Status**: Complete  
**Artifacts**:

- ✅ `research.md` - All technology decisions documented
- ✅ E2E framework selected (Playwright)
- ✅ Email service strategy resolved (Cognito default)

---

### Phase 1: Design & Contracts ✅ COMPLETE

**Status**: Complete  
**Artifacts**:

- ✅ `data-model.md` - Entities, schemas, validation rules
- ✅ `contracts/signup-api.yaml` - OpenAPI specification
- ✅ `quickstart.md` - Local development setup guide
- ✅ Agent context updated

**Re-evaluation**: Constitution Check ✅ PASS

- Email service clarification resolved (using Cognito default, 50 emails/day)
- All gates still passing
- No new violations introduced

---

### Phase 2: Task Breakdown (Next Step)

**Status**: Pending  
**Action**: Run `/speckit.tasks` command to generate `tasks.md`

**Expected tasks** (preview):

1. Backend scaffolding (NestJS modules, DTOs)
2. Cognito integration (CognitoService)
3. Database setup (Prisma schema, migrations)
4. API endpoints (AuthController)
5. Frontend scaffolding (pages, components, hooks)
6. Form validation logic
7. State management (Jotai atoms)
8. LocalStack setup (Compose file, setup script)
9. Testing (unit, integration, E2E)
10. Documentation updates

---

### Phase 3: Implementation (Future)

**Prerequisite**: `tasks.md` approved and ready

**Approach**:

- Human-led implementation following tasks
- AI assists with code generation, explanations
- Iterative development with frequent testing
- Local AI review before PR

**Quality checks**:

- Lint, type-check pass
- Unit tests pass with 70%+ coverage
- Integration tests pass
- E2E tests pass (critical paths)

---

### Phase 4: Review & Deployment (Future)

**Steps**:

1. Local AI review (AgentSkills)
2. Create PR via `pr-creator` skill
3. GitHub Actions CI (automated tests)
4. Human code review
5. Address feedback
6. Squash merge to main

---

## Risks and Mitigations

### Risk 1: LocalStack Cognito Behavior Differences

**Impact**: High  
**Likelihood**: Medium

**Risk**: LocalStack's Cognito implementation may differ from real AWS Cognito, causing unexpected behavior in production.

**Mitigation**:

- Document known differences in `quickstart.md`
- Use real Cognito in staging environment before production
- Test critical flows (signup, verify) against real Cognito early
- Keep LocalStack updated to latest version
- Add integration tests that can run against both LocalStack and real Cognito

---

### Risk 2: Email Verification Link Format

**Impact**: Medium  
**Likelihood**: Low

**Risk**: Email verification link format may not work correctly with email clients or URL encoding.

**Mitigation**:

- Test with multiple email clients (Gmail, Outlook, Apple Mail)
- Use standard URL encoding for email parameter
- Provide fallback: manual code entry form
- Log verification attempts for debugging
- E2E tests cover email link click simulation

---

### Risk 3: Password Validation Inconsistency

**Impact**: High  
**Likelihood**: Low

**Risk**: Frontend and backend password validation rules may drift, causing user frustration.

**Mitigation**:

- Share validation regex between frontend and backend (via shared types package future)
- Document password rules in OpenAPI spec
- Unit tests verify same password against both validators
- Update both validators together in single commit
- Add contract tests to verify frontend/backend alignment

---

### Risk 4: Token Management Security

**Impact**: Critical  
**Likelihood**: Low

**Risk**: Insecure token storage (XSS) or transmission could compromise user accounts.

**Mitigation**:

- Store tokens in memory (Jotai state) + httpOnly cookies (future)
- Never expose tokens in URLs (use response body only)
- Implement CSRF protection for token refresh
- Set short token expiration (1 hour)
- Use refresh tokens for prolonged sessions
- Add security headers (CSP, X-Frame-Options)

---

### Risk 5: Rate Limiting for Signup

**Impact**: Medium  
**Likelihood**: Medium

**Risk**: Missing rate limiting could allow spam signups or abuse.

**Mitigation**:

- AWS API Gateway has built-in throttling (5000 req/s burst, 2000 req/s steady)
- Add NestJS throttler guard for local development
- Cognito has built-in brute force protection
- Monitor CloudWatch metrics for unusual signup patterns
- Consider CAPTCHA for production (future enhancement)

---

### Risk 6: Database Migration in Lambda

**Impact**: Low  
**Likelihood**: Low

**Risk**: Prisma migrations on `/tmp` SQLite in Lambda won't persist between invocations.

**Mitigation**:

- This is expected behavior for MVP (learning mode)
- Document clearly in `README.md` that Lambda DB is volatile
- For production, migration path documented:
  - Move to RDS PostgreSQL or DynamoDB
  - Or use persistent storage layer (EFS) for SQLite
- Current approach acceptable for learning/testing

---

## Dependencies

### External Services

- ✅ AWS Cognito User Pool (or LocalStack for local dev)
- ✅ Email service (Cognito default email, 50/day limit)
- 🔲 AWS Lambda + API Gateway (deployment only, not needed for local dev)

### NPM Packages

**Backend** (`backend/package.json`):

```json
{
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/config": "^3.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "@aws-sdk/client-cognito-identity-provider": "^3.0.0",
    "@prisma/client": "^5.0.0",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.0"
  },
  "devDependencies": {
    "@nestjs/testing": "^10.0.0",
    "@types/node": "^20.0.0",
    "jest": "^29.0.0",
    "supertest": "^6.3.0",
    "prisma": "^5.0.0",
    "typescript": "^5.0.0"
  }
}
```

**Frontend** (`frontend/package.json`):

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "jotai": "^2.6.0",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "vitest": "^1.0.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/user-event": "^14.0.0",
    "@playwright/test": "^1.40.0"
  }
}
```

### Infrastructure

- 🔲 Terraform modules (Cognito User Pool, Lambda, API Gateway) - Phase 4
- ✅ LocalStack for local development
- ✅ Podman Compose for container orchestration

---

## Next Steps

### Immediate Actions

1. ✅ **Phase 0 Complete**: Research documented
2. ✅ **Phase 1 Complete**: Design artifacts created
3. 📝 **Generate tasks.md**: Run `/speckit.tasks` command
4. 👀 **Human review**: Review plan, research, data-model, contracts, quickstart
5. ✅ **Approve**: Confirm all artifacts are accurate and complete

### Before Implementation

1. Review all acceptance criteria in `spec.md`
2. Verify all `[NEEDS CLARIFICATION]` items resolved
3. Ensure development environment is ready (devcontainer, LocalStack)
4. Run through `quickstart.md` setup steps to validate
5. Confirm test strategy and coverage targets

### During Implementation

1. Follow `tasks.md` task-by-task
2. Write tests first (TDD approach preferred)
3. Run tests frequently (`npm run test:watch`)
4. Commit after each task completion
5. Use descriptive commit messages referencing task IDs

### Before PR

1. Run full test suite: `npm run test:cov`
2. Verify 70%+ coverage achieved
3. Run linter: `npm run lint`
4. Run type checker: `npm run type-check`
5. Local AI review via AgentSkills
6. Manual UI testing against acceptance criteria

---

## Related Documents

- **Specification**: [`spec.md`](./spec.md) - Feature requirements and user stories
- **Research**: [`research.md`](./research.md) - Technology decisions and best practices
- **Data Model**: [`data-model.md`](./data-model.md) - Entities, schemas, validation rules
- **API Contract**: [`contracts/signup-api.yaml`](./contracts/signup-api.yaml) - OpenAPI specification
- **Setup Guide**: [`quickstart.md`](./quickstart.md) - Local development instructions
- **Project Standards**: [`/.github/copilot-instructions.md`](../../.github/copilot-instructions.md) - Coding standards and workflow

---

**Plan Status**: ✅ COMPLETE (Phase 0 & Phase 1)  
**Next Command**: `/speckit.tasks` to generate implementation tasks  
**Ready for**: Human review and approval before task generation

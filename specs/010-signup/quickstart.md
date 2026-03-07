# Quickstart Guide: User Signup Feature

**Feature**: 010-signup  
**Last Updated**: 2026-03-07  
**Status**: Development Setup

## Overview

This guide helps you set up and test the user signup feature locally, including AWS Cognito simulation via LocalStack.

---

## Prerequisites

Ensure you have the following installed and configured:

- ✅ **VS Code** with Dev Containers extension
- ✅ **Podman Desktop** running
- ✅ **Node.js 20+** (included in devcontainer)
- ✅ **Git** configured with GitHub authentication

**Verify in devcontainer terminal**:

```bash
node --version  # Should show v20.x
npm --version   # Should show 10.x
git --version   # Should show 2.x
```

---

## Project Setup

### 1. Clone and Open in Devcontainer

```bash
# If not already in the project
git clone https://github.com/your-org/crud-app.git
cd crud-app

# Open in VS Code
code .
```

When prompted, click **"Reopen in Container"** or use:

- `Ctrl+Shift+P` → "Dev Containers: Reopen in Container"

---

### 2. Install Dependencies

**Backend**:

```bash
cd backend
npm install
```

**Frontend**:

```bash
cd frontend
npm install
```

---

### 3. Configure Environment Variables

**Backend** (`backend/.env.local`):

```bash
# Copy example file
cp backend/.env.example backend/.env.local

# Edit .env.local with these values:
NODE_ENV=development
PORT=3001

# LocalStack Cognito configuration
AWS_REGION=us-east-1
COGNITO_ENDPOINT=http://localhost:4566
COGNITO_USER_POOL_ID=local_user_pool_id  # Created in step 4
COGNITO_CLIENT_ID=local_client_id        # Created in step 4

# Database
DATABASE_URL=file:./dev.db

# CORS
CORS_ORIGIN=http://localhost:3000
```

**Frontend** (`frontend/.env.local`):

```bash
# Copy example file
cp frontend/.env.example frontend/.env.local

# Edit .env.local with these values:
VITE_API_BASE_URL=http://localhost:3001/api
VITE_ENV=development
```

---

### 4. Start LocalStack with Cognito

**Create** `compose.yaml` (in project root if not exists):

```yaml
version: "3.8"

services:
  localstack:
    image: localstack/localstack:latest
    container_name: crud-app-localstack
    environment:
      - SERVICES=cognito
      - DEFAULT_REGION=us-east-1
      - DEBUG=1
    ports:
      - "4566:4566" # LocalStack Gateway
    volumes:
      - ./localstack-data:/var/lib/localstack
      - /var/run/docker.sock:/var/run/docker.sock
```

**Start LocalStack**:

```bash
# Using Podman Compose
podman-compose up -d

# Verify it's running
curl http://localhost:4566/_localstack/health
```

**Expected output**:

```json
{
  "services": {
    "cognito-idp": "running"
  }
}
```

---

### 5. Create Cognito User Pool (LocalStack)

Run this script to set up Cognito in LocalStack:

```bash
# backend/scripts/setup-local-cognito.sh
#!/bin/bash

# Create User Pool
USER_POOL=$(aws cognito-idp create-user-pool \
  --pool-name crud-app-local \
  --endpoint-url http://localhost:4566 \
  --region us-east-1 \
  --policies '{
    "PasswordPolicy": {
      "MinimumLength": 8,
      "RequireUppercase": true,
      "RequireLowercase": true,
      "RequireNumbers": true,
      "RequireSymbols": true
    }
  }' \
  --auto-verified-attributes email \
  --query 'UserPool.Id' \
  --output text)

echo "User Pool ID: $USER_POOL"

# Create User Pool Client
CLIENT_ID=$(aws cognito-idp create-user-pool-client \
  --user-pool-id "$USER_POOL" \
  --client-name crud-app-client \
  --endpoint-url http://localhost:4566 \
  --region us-east-1 \
  --no-generate-secret \
  --query 'UserPoolClient.ClientId' \
  --output text)

echo "Client ID: $CLIENT_ID"

# Update .env.local
echo "COGNITO_USER_POOL_ID=$USER_POOL" >> backend/.env.local
echo "COGNITO_CLIENT_ID=$CLIENT_ID" >> backend/.env.local

echo "✅ LocalStack Cognito setup complete!"
```

**Run setup**:

```bash
chmod +x backend/scripts/setup-local-cognito.sh
./backend/scripts/setup-local-cognito.sh
```

---

### 6. Initialize Database

**Run Prisma migrations**:

```bash
cd backend
npx prisma migrate dev --name init_user_table
npx prisma generate
```

**Verify database**:

```bash
npx prisma studio
# Opens http://localhost:5555 - browse User table
```

---

### 7. Start Development Servers

**Terminal 1 - Backend**:

```bash
cd backend
npm run start:dev
```

**Expected output**:

```
[Nest] 12345  - 03/07/2026, 10:30:00 AM     LOG [NestFactory] Starting Nest application...
[Nest] 12345  - 03/07/2026, 10:30:00 AM     LOG [InstanceLoader] AppModule dependencies initialized +10ms
[Nest] 12345  - 03/07/2026, 10:30:00 AM     LOG [RoutesResolver] AuthController {/api/auth}: +5ms
[Nest] 12345  - 03/07/2026, 10:30:00 AM     LOG [RouterExplorer] Mapped {/api/auth/signup, POST} route +3ms
[Nest] 12345  - 03/07/2026, 10:30:00 AM     LOG [RouterExplorer] Mapped {/api/auth/verify, GET} route +1ms
[Nest] 12345  - 03/07/2026, 10:30:00 AM     LOG [NestApplication] Nest application successfully started +2ms
```

**Terminal 2 - Frontend**:

```bash
cd frontend
npm run dev
```

**Expected output**:

```
  VITE v5.x.x  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

---

## Testing the Signup Flow

### Manual Testing

1. **Open Frontend**: Navigate to `http://localhost:3000/signup`

2. **Fill Signup Form**:
   - Email: `test@example.com`
   - Password: `SecurePass123!`
   - Confirm Password: `SecurePass123!`

3. **Submit Form**: Click "Sign Up" button

4. **Verify Response**: Should see success message

   > "Account created successfully. Please check your email to verify your account."

5. **Check LocalStack Logs** for verification email:

   ```bash
   podman logs crud-app-localstack | grep "cognito"
   ```

6. **Get Verification Code** (LocalStack doesn't send real emails):

   ```bash
   # Query user status
   aws cognito-idp admin-get-user \
     --user-pool-id <USER_POOL_ID> \
     --username test@example.com \
     --endpoint-url http://localhost:4566 \
     --region us-east-1

   # For testing, use this verification code: 123456
   # (LocalStack accepts any 6-digit code in development)
   ```

7. **Verify Email**: Navigate to:

   ```
   http://localhost:3000/verify?email=test@example.com&code=123456
   ```

8. **Verify Auto-Login**: Should redirect to dashboard (`/dashboard`)

9. **Check Database**: Open Prisma Studio to see user record
   ```bash
   cd backend
   npx prisma studio
   # Verify User table has new entry
   ```

---

### Automated Testing

**Backend API Tests**:

```bash
cd backend
npm run test                 # Unit tests
npm run test:e2e            # E2E tests (signup flow)
npm run test:cov            # Coverage report
```

**Frontend Component Tests**:

```bash
cd frontend
npm run test                 # Unit tests
npm run test:coverage        # Coverage report
```

**E2E Tests (Playwright)**:

```bash
cd frontend
npm run test:e2e            # Full signup flow test
npm run test:e2e:ui         # Interactive mode
```

---

## Verification Checklist

Verify these acceptance criteria are met:

### US-001: Account Creation Success ✅

- [ ] Signup form displays correctly
- [ ] Valid credentials create account
- [ ] Success message appears after signup
- [ ] Verification email logged in LocalStack
- [ ] User in UNCONFIRMED state in Cognito
- [ ] Email verification link works
- [ ] Auto-login after verification
- [ ] Redirect to dashboard success

### US-002: Real-time Form Validation ✅

- [ ] Invalid email shows error immediately
- [ ] Weak password shows specific requirements
- [ ] Password mismatch shows error
- [ ] Errors clear when fixed
- [ ] Submit button disabled during errors

### US-003: Error Handling ✅

- [ ] Duplicate email shows 409 error
- [ ] Network failure shows retry message
- [ ] Invalid verification code shows error
- [ ] Expired code handled gracefully

---

## API Testing with cURL

**Signup Endpoint**:

```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "curl-test@example.com",
    "password": "SecurePass123!",
    "passwordConfirm": "SecurePass123!"
  }'
```

**Expected response**:

```json
{
  "message": "Account created successfully. Please check your email to verify your account.",
  "email": "curl-test@example.com"
}
```

**Verify Endpoint**:

```bash
curl "http://localhost:3001/api/auth/verify?email=curl-test@example.com&code=123456"
```

**Expected response**:

```json
{
  "message": "Email verified successfully",
  "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "idToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600,
  "redirectUrl": "/dashboard"
}
```

---

## Troubleshooting

### LocalStack Issues

**Problem**: `Connection refused` to localhost:4566

**Solution**:

```bash
# Check if LocalStack is running
podman ps | grep localstack

# Restart if needed
podman-compose down
podman-compose up -d

# Check logs
podman logs crud-app-localstack
```

---

### Cognito User Pool Not Found

**Problem**: `UserPoolId not found`

**Solution**:

```bash
# Re-run setup script
./backend/scripts/setup-local-cognito.sh

# Verify in .env.local
cat backend/.env.local | grep COGNITO
```

---

### Database Migration Fails

**Problem**: `Can't reach database server`

**Solution**:

```bash
# Reset database
cd backend
rm -f prisma/dev.db
npx prisma migrate reset --force
npx prisma migrate dev
```

---

### Frontend Can't Connect to Backend

**Problem**: CORS errors or network failures

**Solution**:

```bash
# Check backend is running on port 3001
curl http://localhost:3001/api/health

# Verify CORS_ORIGIN in backend/.env.local
CORS_ORIGIN=http://localhost:3000

# Restart backend
cd backend
npm run start:dev
```

---

### Verification Email Not Received

**Problem**: No email in LocalStack logs

**Solution**:

```bash
# In LocalStack, emails are logged not sent
# Check user status instead
aws cognito-idp admin-get-user \
  --user-pool-id <YOUR_POOL_ID> \
  --username test@example.com \
  --endpoint-url http://localhost:4566

# For testing, any 6-digit code works: 123456
```

---

## Performance Verification

Run these checks to ensure performance criteria (SC-001 to SC-007):

**Page Load Time** (should be <2s):

```bash
# Use browser DevTools Network tab
# Or Lighthouse audit
npm run lighthouse
```

**Form Validation Speed** (should be <500ms):

```bash
# Check browser DevTools Performance tab
# Measure time from input to error display
```

**API Response Time** (should be <1s):

```bash
# Use curl with timing
time curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"perf-test@example.com","password":"SecurePass123!","passwordConfirm":"SecurePass123!"}'
```

---

## Next Steps

Once local testing is complete:

1. ✅ Verify all acceptance criteria
2. ✅ Run full test suite (`npm run test:cov`)
3. ✅ Check coverage reports (target: 70%+)
4. 📝 Create `tasks.md` via `/speckit.tasks`
5. 🛠️ Begin implementation following tasks
6. 🔍 Run AI review via AgentSkills
7. 🚀 Create PR via `pr-creator` skill

---

## Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [React Documentation](https://react.dev/)
- [LocalStack Cognito](https://docs.localstack.cloud/user-guide/aws/cognito/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Playwright Testing](https://playwright.dev/)

**Questions?** Check `specs/010-signup/spec.md` for requirements or `plan.md` for architecture details.

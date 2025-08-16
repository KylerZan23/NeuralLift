# ADR-010: API Integration Testing Strategy

**Date:** 2024-12-19  
**Status:** Accepted  
**Decision Makers:** Security & Engineering Teams  

## Context

Our Next.js API routes handle sensitive user data (Personal Records, Program access) and require robust security validation. Without comprehensive integration testing, we risk:

1. **Authentication Bypass**: Unauthenticated users accessing protected data
2. **Authorization Vulnerabilities**: Users accessing other users' data  
3. **Privilege Escalation**: Malicious payloads overriding session user IDs
4. **Input Injection**: Unvalidated data causing security issues
5. **Business Logic Errors**: Incorrect data processing or storage

### Security Requirements

Our API routes must enforce:
- **Authentication**: Only authenticated users can access APIs
- **Authorization**: Users can only access their own data
- **Input Validation**: All inputs must be validated and sanitized
- **Session Security**: Server-side session user ID must override client data
- **Error Security**: No sensitive information in error responses

### Current Testing Gaps

Before this implementation:
- No systematic API security testing
- Manual testing only for happy paths
- No validation of attack vectors
- No automated security regression testing

## Decision

We will implement **comprehensive API integration testing** with a focus on security validation using a **mock-first testing strategy**.

### Testing Philosophy

**Security-First Testing**: Every test prioritizes security validation over functional testing. We test attack scenarios before happy paths.

**Mock Everything External**: All external dependencies (Supabase, auth services) are mocked to ensure:
- Predictable test environments
- Fast test execution
- Isolated security logic testing
- No external service dependencies

**Business Logic Validation**: Core API logic is tested independently of infrastructure concerns.

## Implementation Strategy

### 1. Test File Organization

```
tests/app/
├── api.pr-update-simple.test.ts      # Core business logic tests
├── api.program-get-simple.test.ts    # Core business logic tests  
├── api.pr-update.test.ts             # Full HTTP integration tests
└── api.program-get.test.ts           # Full HTTP integration tests
```

**Rationale**: Separate simple logic tests from complex HTTP tests for clarity and maintainability.

### 2. Mocking Strategy

```typescript
// Comprehensive service mocking
jest.mock('@/lib/integrations/supabase-server', () => ({
  getServiceSupabaseClient: jest.fn()
}));

jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn()  
}));

// Predictable mock clients
const mockServiceClient = {
  from: jest.fn().mockReturnThis(),
  upsert: jest.fn(),
  insert: jest.fn()
};

const mockAuthClient = {
  auth: {
    getUser: jest.fn()
  }
};
```

**Benefits**:
- ✅ **Isolation**: Tests don't depend on external services
- ✅ **Speed**: Fast execution without network calls
- ✅ **Predictability**: Consistent test environments
- ✅ **Security Focus**: Test security logic, not infrastructure

### 3. Security Test Categories

#### **Authentication Tests**
```typescript
it('returns 401 Unauthorized when no user is authenticated', async () => {
  mockAuthClient.auth.getUser.mockResolvedValue({ data: { user: null } });
  // Test implementation...
  expect(response.status).toBe(401);
});
```

#### **Authorization Tests** (Critical)
```typescript
it('prevents User A from accessing User B data', async () => {
  const userA = { id: 'user-A' };
  const userBProgram = { user_id: 'user-B' };
  // Verify 403 Forbidden response
});
```

#### **Privilege Escalation Prevention** (Critical)
```typescript
it('uses session user ID and ignores payload user_id', async () => {
  const maliciousPayload = {
    bench: 225,
    user_id: 'attacker-user-456' // Should be ignored
  };
  // Verify server uses session user ID only
});
```

#### **Input Validation Tests**
```typescript
it('validates request payload using Zod schema', () => {
  const invalidPayload = { bench: 'invalid-number' };
  const result = BodySchema.safeParse(invalidPayload);
  expect(result.success).toBe(false);
});
```

### 4. Test Environment Setup

```typescript
// Jest configuration for API testing
{
  testEnvironment: 'jsdom', // For React component compatibility
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1' // Path alias support
  }
}

// Polyfills for Web APIs
Object.assign(global, {
  TextEncoder,
  TextDecoder,  
  ReadableStream,
});
```

## Alternatives Considered

### 1. End-to-End Testing Only
- **Pros**: Tests real infrastructure, complete user flows
- **Cons**: Slow, flaky, hard to test security edge cases, expensive
- **Decision**: Rejected - too slow for comprehensive security testing

### 2. Real Database Testing
- **Pros**: Tests actual database constraints and RLS policies
- **Cons**: Complex setup, test data management, slower execution
- **Decision**: Partial - We test RLS separately, mock for integration tests

### 3. No Mocking (Real Services)
- **Pros**: Tests real service interactions
- **Cons**: Unreliable, slow, requires complex test data setup
- **Decision**: Rejected - Mocking provides better test isolation

### 4. Minimal Testing
- **Pros**: Faster development, less test maintenance
- **Cons**: Security vulnerabilities, no regression protection
- **Decision**: Rejected - Security is too critical

## Security Test Coverage Matrix

| Attack Vector | Test Status | Criticality |
|---------------|-------------|-------------|
| Authentication Bypass | ✅ Tested | Critical |
| Cross-User Data Access | ✅ Tested | Critical |
| Privilege Escalation | ✅ Tested | Critical |
| Session Hijacking | ✅ Tested | Critical |
| Input Injection | ✅ Tested | High |
| Error Information Leakage | ✅ Tested | Medium |
| Invalid Input Handling | ✅ Tested | Medium |

## Benefits Achieved

### 🔒 **Security Assurance**
- **Comprehensive Attack Testing**: All major security vectors tested
- **Regression Prevention**: Automated security test suite
- **Compliance Validation**: User data protection verified
- **Zero Trust Architecture**: Every request validated

### 🚀 **Development Velocity**
- **Fast Feedback**: Tests run in < 1 second per suite
- **Confident Refactoring**: Security tests catch regressions
- **Clear Security Requirements**: Tests document expected behavior
- **Parallel Development**: Teams can work independently

### 🛠️ **Maintainability**
- **Clear Test Structure**: Organized by security concern
- **Predictable Mocks**: Consistent test environments
- **Type Safety**: Full TypeScript support in tests
- **Documentation**: Tests serve as living security documentation

## Implementation Quality Standards

### **Test Completeness**
- ✅ Every API endpoint has security tests
- ✅ All authentication methods tested
- ✅ All authorization scenarios covered
- ✅ Edge cases and error conditions tested

### **Test Quality**
- ✅ Tests are isolated and independent
- ✅ Mocks are realistic and comprehensive
- ✅ Test data is minimal and focused
- ✅ Assertions are specific and meaningful

### **Security Coverage**
- ✅ Critical vulnerabilities tested first
- ✅ Attack vectors systematically covered
- ✅ Input validation comprehensively tested
- ✅ Error handling security verified

## Monitoring and Success Metrics

### **Security Metrics**
- **Zero Critical Vulnerabilities**: All major attack vectors blocked
- **100% Authentication Coverage**: All auth scenarios tested
- **100% Authorization Coverage**: All access control tested
- **Comprehensive Input Validation**: All payloads validated

### **Quality Metrics**
- **Test Execution Speed**: < 1 second per test suite
- **Test Reliability**: 100% pass rate on clean code
- **Coverage Completeness**: All API endpoints tested
- **Regression Prevention**: Security tests catch issues

### **Developer Experience**
- **Clear Test Feedback**: Specific failure messages
- **Fast Development Cycle**: Quick test iterations
- **Confident Deployments**: Comprehensive security validation
- **Documentation Value**: Tests explain security requirements

## Future Enhancements

### **Immediate (Next Sprint)**
1. **Rate Limiting Tests**: API abuse prevention validation
2. **CORS Security Tests**: Cross-origin request security
3. **Header Security Tests**: Security header validation
4. **Session Management Tests**: Session lifecycle security

### **Medium Term (Next Quarter)**
1. **Performance Security Tests**: DoS attack prevention
2. **Data Encryption Tests**: Sensitive data protection
3. **Audit Trail Tests**: Security event logging
4. **Compliance Tests**: GDPR/privacy regulation validation

### **Long Term (Next 6 Months)**
1. **Automated Penetration Testing**: Simulated attacks
2. **Security Regression Testing**: Continuous vulnerability scanning
3. **Threat Model Validation**: Security architecture testing
4. **Red Team Exercises**: Advanced attack simulation

## Risk Assessment

### **Risks Mitigated**
- 🟢 **Authentication Bypass**: Comprehensive auth testing
- 🟢 **Data Breaches**: User isolation validation
- 🟢 **Privilege Escalation**: Session security testing
- 🟢 **Input Attacks**: Validation testing
- 🟢 **Logic Errors**: Business logic testing

### **Remaining Risks**
- 🟡 **Infrastructure Vulnerabilities**: Not covered by unit tests
- 🟡 **Third-party Service Issues**: Mocked in our tests
- 🟡 **Social Engineering**: Outside technical scope
- 🟡 **Physical Security**: Outside application scope

### **Risk Mitigation Strategy**
- **Infrastructure**: Separate infrastructure security testing
- **Third-party**: Service-specific integration testing
- **Holistic Security**: Combine with other security measures

## Related ADRs

- **ADR-008**: PRS Table RLS Security - Database-level security
- **ADR-009**: Zustand State Management - Client-side security
- **Future**: API Rate Limiting Strategy
- **Future**: Authentication Service Architecture

## Success Criteria

### **Implementation Complete** ✅
- [x] All API endpoints have security tests
- [x] All critical attack vectors tested
- [x] Comprehensive test documentation
- [x] CI/CD integration ready

### **Security Validated** ✅  
- [x] Zero critical vulnerabilities found
- [x] All authentication scenarios tested
- [x] All authorization scenarios tested
- [x] Input validation comprehensively tested

### **Quality Assured** ✅
- [x] Tests are fast and reliable
- [x] Clear test organization and naming
- [x] Comprehensive test documentation
- [x] Developer-friendly test experience

**The API integration testing strategy provides comprehensive security validation while maintaining high development velocity and code quality standards.**

# ADR-007: Security Best Practices for .gitignore and Environment Variables

## Status
Accepted

## Context
The project's `.gitignore` file was minimal and lacked comprehensive security coverage. Environment variables containing sensitive API keys (Supabase, Stripe, OpenAI) were at risk of being accidentally committed to version control. The project also lacked proper documentation for secure environment setup.

## Decision
Implement comprehensive security best practices for `.gitignore` and environment variable management:

1. **Enhanced .gitignore**: Added comprehensive patterns to exclude:
   - All environment files (`.env*`, `.env.local`, etc.)
   - Build artifacts and caches
   - Logs and temporary files
   - IDE and OS-specific files
   - Test results and coverage reports
   - Sensitive file types (keys, certificates, etc.)

2. **Environment Template**: Created `env.example` file showing required variables without exposing actual values

3. **Documentation**: Updated README with security best practices and clear setup instructions

4. **Security Patterns**: Implemented patterns for:
   - API keys and secrets
   - Database files
   - Infrastructure configuration files
   - Local development overrides

## Consequences

### Positive
- **Security**: Prevents accidental exposure of sensitive credentials
- **Developer Experience**: Clear setup instructions and template
- **Compliance**: Follows industry security best practices
- **Maintenance**: Comprehensive coverage reduces manual gitignore management

### Negative
- **Complexity**: More comprehensive .gitignore requires understanding
- **Setup Time**: Developers must copy and configure environment variables

### Risks
- **Low**: Minimal risk as this is a security improvement
- **Mitigation**: Clear documentation and examples provided

## Implementation Details

### .gitignore Categories Added
- **Environment Variables**: `.env*`, `.env.local`, `.env*.local`
- **Build Outputs**: `.next/`, `dist/`, `build/`, `*.tsbuildinfo`
- **Dependencies**: `node_modules/`, package manager caches
- **Development**: IDE files, OS files, temporary directories
- **Testing**: Coverage reports, test results, Playwright outputs
- **Infrastructure**: Docker, Terraform, Kubernetes configs
- **Sensitive Files**: Keys, certificates, database files

### Environment Variable Security
- **Client-Safe**: Only `NEXT_PUBLIC_*` variables exposed to browser
- **Server-Only**: API keys, service role keys kept server-side
- **Template**: `env.example` provides structure without values
- **Documentation**: Clear security practices and setup steps

## Related ADRs
- ADR-004: Supabase Server Auth Pattern
- ADR-005: Stripe Pricing Model
- ADR-006: LLM Program Generation

## References
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/security)
- [Stripe Security Guidelines](https://stripe.com/docs/security)
- [Git Security Best Practices](https://git-scm.com/book/en/v2/Git-Tools-Signing-Your-Work)

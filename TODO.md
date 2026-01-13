# TODO - Future Features & Enhancements

## 🎯 High Priority

### 1. Multiple Auth Providers
**Status**: Planned
**Description**: Extend beyond Google OAuth to support multiple authentication providers

- [ ] GitHub OAuth
- [ ] Discord OAuth
- [ ] Twitter/X OAuth
- [ ] Facebook OAuth
- [ ] Credentials (username/password)
- [ ] Email (Magic Link)
- [ ] Apple Sign In
- [ ] Interactive provider selection during CLI execution
- [ ] Multi-provider setup (allow selecting multiple providers at once)
- [ ] Provider-specific component variants

**Implementation Notes**:
- Create template variants for each provider
- Update `generator.ts` to accept provider selection
- Add interactive prompts using `@clack/prompts`
- Generate provider-specific environment variables

---

### 2. Configuration File (`next-auth-cli.json`)
**Status**: Planned
**Description**: Allow users to define custom configuration in their project root

**Configuration Schema**:
```json
{
  "providers": ["google", "github"],
  "protectedRoutes": [
    "/dashboard/:path*",
    "/admin/:path*",
    "/api/protected/:path*"
  ],
  "envMapping": {
    "google": {
      "clientId": "GOOGLE_ID",
      "clientSecret": "GOOGLE_SECRET"
    },
    "github": {
      "clientId": "GH_CLIENT_ID",
      "clientSecret": "GH_CLIENT_SECRET"
    }
  },
  "components": {
    "outputPath": "components/auth",
    "loginButton": "sign-in-button.tsx",
    "userProfile": "user-card.tsx"
  },
  "callbacks": {
    "signIn": "/auth/signin",
    "signOut": "/",
    "error": "/auth/error"
  },
  "session": {
    "strategy": "jwt",
    "maxAge": 2592000
  }
}
```

**Tasks**:
- [ ] Define JSON schema for configuration
- [ ] Add config file detection in CLI
- [ ] Parse and validate configuration
- [ ] Apply custom env variable mappings to generated files
- [ ] Respect custom protected routes in middleware
- [ ] Allow custom component paths and filenames
- [ ] Generate example config with `--init` flag
- [ ] Add config validation with helpful error messages

**Benefits**:
- Users can maintain their existing env variable naming
- Flexible route protection
- Customizable component structure
- Project-specific configuration without CLI flags

---

### 3. Interactive Setup Mode
**Status**: Planned
**Description**: Add interactive prompts for a guided setup experience

**Features**:
- [ ] Provider selection (checkbox/multi-select)
- [ ] Protected routes input (comma-separated or one-by-one)
- [ ] Component naming preferences
- [ ] Overwrite confirmation for existing files
- [ ] Database adapter selection (none, Prisma, Drizzle)
- [ ] Session strategy selection (JWT vs Database)
- [ ] Optional features (email verification, 2FA, etc.)

**Tools**:
- Use `@clack/prompts` for beautiful CLI interactions
- Add `--interactive` or `-i` flag
- Keep non-interactive mode as default for CI/CD

---

## 🚀 Medium Priority

### 4. Pages Router Support
**Status**: Planned
**Description**: Support Next.js Pages Router alongside App Router

**Tasks**:
- [ ] Detect Pages Router (`pages/` directory)
- [ ] Generate `pages/api/auth/[...nextauth].ts` instead of App Router version
- [ ] Adjust middleware for Pages Router
- [ ] Update components to work with `getServerSideProps`/`getStaticProps`
- [ ] Add migration guide from Pages to App Router

---

### 5. Database Session Support
**Status**: Planned
**Description**: Add support for database sessions with ORM adapters

**Supported Adapters**:
- [ ] Prisma
- [ ] Drizzle
- [ ] TypeORM
- [ ] Kysely

**Tasks**:
- [ ] Detect existing ORM in project
- [ ] Generate adapter configuration
- [ ] Create database schema files
- [ ] Add migration instructions
- [ ] Generate model types for User, Account, Session, VerificationToken
- [ ] Connection setup and database URL configuration

---

### 6. Custom Sign-in/Sign-out Pages
**Status**: Planned
**Description**: Generate custom authentication pages

**Tasks**:
- [ ] Create `app/auth/signin/page.tsx` template
- [ ] Create `app/auth/signout/page.tsx` template
- [ ] Create `app/auth/error/page.tsx` template
- [ ] Add styling options (Tailwind, CSS Modules, styled-components)
- [ ] Configure NextAuth to use custom pages

---

## 💡 Low Priority / Nice to Have

### 7. Role-Based Access Control (RBAC)
**Status**: Idea
**Description**: Add role and permission management

**Features**:
- [ ] User roles (admin, user, moderator, etc.)
- [ ] Permission-based middleware
- [ ] Protected component wrapper (`<RequireRole role="admin">`)
- [ ] Helper hooks (`useRole()`, `usePermission()`)

---

### 8. Email Verification Flow
**Status**: Idea
**Description**: Add email verification for new users

**Tasks**:
- [ ] Email provider setup (Resend, SendGrid, Nodemailer)
- [ ] Verification email template
- [ ] Verification page component
- [ ] Token generation and validation
- [ ] Database schema for verification tokens

---

### 9. Two-Factor Authentication (2FA)
**Status**: Idea
**Description**: Add optional 2FA support

**Tasks**:
- [ ] TOTP (Time-based OTP) setup
- [ ] QR code generation for authenticator apps
- [ ] Backup codes generation
- [ ] 2FA enrollment page
- [ ] 2FA verification during sign-in

---

### 10. CLI Enhancements

**Tasks**:
- [ ] `--dry-run` flag to preview changes without writing files
- [ ] `--update` flag to update existing NextAuth setup
- [ ] `--remove` flag to safely remove NextAuth files
- [ ] `--version` or `-v` for version info
- [ ] `--help` or `-h` for detailed help
- [ ] Better error messages with suggestions
- [ ] Color-coded output for better readability (already using chalk)
- [ ] Progress indicators for file generation

---

### 11. Testing & Quality

**Tasks**:
- [ ] Unit tests for utility functions
- [ ] Integration tests for file generation
- [ ] E2E tests in sample Next.js projects
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Automated releases with semantic versioning
- [ ] Test coverage reporting

---

### 12. Documentation

**Tasks**:
- [ ] Video tutorial for setup
- [ ] Blog post announcement
- [ ] Example projects repository
- [ ] Migration guides (from manual setup, from other auth libs)
- [ ] Troubleshooting guide
- [ ] API reference for generated files
- [ ] Contributing guide

---

### 13. Multi-tenant Support
**Status**: Idea
**Description**: Support for multi-tenant applications

**Features**:
- [ ] Tenant isolation in sessions
- [ ] Per-tenant provider configuration
- [ ] Tenant-aware middleware
- [ ] Subdomain/path-based tenant detection

---

### 14. Analytics & Monitoring
**Status**: Idea
**Description**: Optional analytics integration

**Features**:
- [ ] Login/logout event tracking
- [ ] Failed authentication logging
- [ ] Session analytics
- [ ] Integration with Sentry, PostHog, etc.

---

## 📝 Notes

### Breaking Changes Policy
- Major version bumps for breaking changes
- Deprecation warnings before removal
- Migration guides for major versions

### Community Features
- Accept feature requests via GitHub Issues
- Label issues as `enhancement`, `good-first-issue`
- Encourage community PRs for new providers

### Performance Considerations
- Keep CLI bundle size minimal
- Lazy load templates when needed
- Cache compiled templates

---

## 🤝 Contributing

Want to help implement these features? Check out the [Contributing Guide](CONTRIBUTING.md) (to be created).

Priority areas for contributions:
1. Additional auth providers
2. Interactive mode with `@clack/prompts`
3. Configuration file support
4. Test coverage

---

**Last Updated**: 2026-01-13

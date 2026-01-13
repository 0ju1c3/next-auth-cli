# @0ju1c3/next-auth-cli

A CLI tool to automatically setup NextAuth.js with Google OAuth in Next.js App Router projects.

## Features

- 🚀 **Quick Setup**: Automatically generates all necessary NextAuth.js files
- 🔍 **Smart Detection**: Detects `src/` directory and App Router structure
- 🎨 **Ready-to-use Components**: Pre-built login button and user profile components
- 🔒 **Protected Routes**: Middleware configuration with example protected routes
- 📝 **TypeScript Support**: All generated files are TypeScript-ready
- 🎯 **Google OAuth**: Pre-configured for Google authentication

## Installation

### As a dev dependency (recommended)

```bash
bun add -d @0ju1c3/next-auth-cli
```

or

```bash
npm install -D @0ju1c3/next-auth-cli
```

### Global installation

```bash
bun add -g @0ju1c3/next-auth-cli
```

## Usage

Navigate to your Next.js project root and run:

```bash
bunx next-auth-setup
```

or with npx:

```bash
npx @0ju1c3/next-auth-cli
```

## What Gets Generated

The CLI creates the following files in your project:

### 1. **Authentication Configuration**
- `auth.ts` (or `src/auth.ts`) - NextAuth.js configuration with Google provider

### 2. **Middleware**
- `middleware.ts` (or `src/middleware.ts`) - Route protection for `/dashboard/*` and `/profile/*`

### 3. **API Route**
- `app/api/auth/[...nextauth]/route.ts` - NextAuth.js route handler

### 4. **Components**
- `components/login-button.tsx` - Sign in/out button component
- `components/user-profile.tsx` - User profile display component

### 5. **Environment Template**
- `.env.local.example` - Template for required environment variables

## Post-Installation Steps

After running the CLI, follow these steps:

### 1. Install NextAuth.js

```bash
bun add next-auth@beta
```

### 2. Setup Environment Variables

Create a `.env.local` file:

```bash
cp .env.local.example .env.local
```

Add your credentials:

```env
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

Generate a secret:

```bash
openssl rand -base64 32
```

### 3. Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Add authorized redirect URI:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
6. Copy the Client ID and Client Secret to your `.env.local`

### 4. Wrap Your App with SessionProvider

Update your `app/layout.tsx`:

```tsx
import { SessionProvider } from "next-auth/react"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
```

### 5. Use the Components

```tsx
import LoginButton from '@/components/login-button'
import UserProfile from '@/components/user-profile'

export default function Page() {
  return (
    <div>
      <LoginButton />
      <UserProfile />
    </div>
  )
}
```

## Protected Routes

The generated middleware protects these routes by default:

- `/dashboard/*` - Dashboard pages
- `/profile/*` - Profile pages

Unauthenticated users will be redirected to the sign-in page.

### Customizing Protected Routes

Edit `middleware.ts` to add or remove protected routes:

```typescript
export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*", "/admin/:path*"],
}
```

## Requirements

- **Next.js**: >=13.0.0 (App Router)
- **React**: >=18.0.0
- **NextAuth.js**: >=5.0.0
- **Bun** or **Node.js**: >=18.0.0

## Project Structure Support

The CLI automatically detects and adapts to your project structure:

### With `src/` directory
```
your-project/
├── src/
│   ├── app/
│   │   └── api/auth/[...nextauth]/route.ts
│   ├── auth.ts
│   └── middleware.ts
└── components/
    ├── login-button.tsx
    └── user-profile.tsx
```

### Without `src/` directory
```
your-project/
├── app/
│   └── api/auth/[...nextauth]/route.ts
├── auth.ts
├── middleware.ts
└── components/
    ├── login-button.tsx
    └── user-profile.tsx
```

## Troubleshooting

### Error: Not a Next.js project

Ensure your `package.json` includes `next` as a dependency:

```json
{
  "dependencies": {
    "next": "^14.0.0"
  }
}
```

### Error: App Router not found

This CLI requires Next.js App Router (`app/` directory). Pages Router is not currently supported.

### OAuth Error: redirect_uri_mismatch

Make sure your Google OAuth redirect URI matches exactly:
```
http://localhost:3000/api/auth/callback/google
```

For production, add:
```
https://yourdomain.com/api/auth/callback/google
```

## License

ISC

## Contributing

Issues and pull requests are welcome! Visit the [GitHub repository](https://github.com/0ju1c3/next-auth-cli).

## Author

[@0ju1c3](https://github.com/0ju1c3)

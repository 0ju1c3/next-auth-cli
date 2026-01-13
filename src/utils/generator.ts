import fs from 'fs-extra';
import { join, dirname } from 'path';
import type { ProjectStructure } from './detect.js';

/**
 * Ensures a directory exists, creating it if necessary
 */
async function ensureDir(path: string): Promise<void> {
  await fs.ensureDir(path);
}

/**
 * Writes a file, creating parent directories if needed
 */
async function writeFile(path: string, content: string): Promise<void> {
  await ensureDir(dirname(path));
  await fs.writeFile(path, content, 'utf-8');
}

/**
 * Generates the middleware.ts file
 */
export async function generateMiddleware(structure: ProjectStructure): Promise<string> {
  const content = `export { auth as middleware } from "./auth"

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*"],
}
`;

  await writeFile(structure.middlewarePath, content);
  return structure.middlewarePath;
}

/**
 * Generates the NextAuth route handler for App Router
 */
export async function generateAuthRoute(structure: ProjectStructure): Promise<string> {
  const authRoutePath = join(structure.appPath, 'api', 'auth', '[...nextauth]', 'route.ts');

  const content = `import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!
      }
      return session
    },
  },
})

export const { GET, POST } = handlers
`;

  await writeFile(authRoutePath, content);
  return authRoutePath;
}

/**
 * Generates the auth.ts file for NextAuth configuration
 */
export async function generateAuthConfig(structure: ProjectStructure): Promise<string> {
  const authConfigPath = structure.hasSrcDir
    ? join(structure.basePath, 'auth.ts')
    : join(process.cwd(), 'auth.ts');

  const content = `import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!
      }
      return session
    },
  },
})
`;

  await writeFile(authConfigPath, content);
  return authConfigPath;
}

/**
 * Generates the UserProfile component
 */
export async function generateUserProfile(structure: ProjectStructure): Promise<string> {
  const userProfilePath = join(structure.componentsPath, 'user-profile.tsx');

  const content = `"use client"

import { useSession } from "next-auth/react"
import { signOut } from "next-auth/react"

export default function UserProfile() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (!session) {
    return <div>Not authenticated</div>
  }

  return (
    <div className="flex flex-col gap-4 p-4 border rounded-lg">
      <div className="flex items-center gap-4">
        {session.user?.image && (
          <img
            src={session.user.image}
            alt={session.user.name || "User"}
            className="w-12 h-12 rounded-full"
          />
        )}
        <div>
          <p className="font-semibold">{session.user?.name}</p>
          <p className="text-sm text-gray-600">{session.user?.email}</p>
        </div>
      </div>
      <button
        onClick={() => signOut()}
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Sign Out
      </button>
    </div>
  )
}
`;

  await writeFile(userProfilePath, content);
  return userProfilePath;
}

/**
 * Generates the LoginButton component
 */
export async function generateLoginButton(structure: ProjectStructure): Promise<string> {
  const loginButtonPath = join(structure.componentsPath, 'login-button.tsx');

  const content = `"use client"

import { signIn, signOut, useSession } from "next-auth/react"

export default function LoginButton() {
  const { data: session } = useSession()

  if (session) {
    return (
      <button
        onClick={() => signOut()}
        className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900"
      >
        Sign Out
      </button>
    )
  }

  return (
    <button
      onClick={() => signIn("google")}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      Sign in with Google
    </button>
  )
}
`;

  await writeFile(loginButtonPath, content);
  return loginButtonPath;
}

/**
 * Generates the .env.local.example file
 */
export async function generateEnvExample(cwd: string): Promise<string> {
  const envExamplePath = join(cwd, '.env.local.example');

  const content = `# NextAuth Configuration
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
`;

  await writeFile(envExamplePath, content);
  return envExamplePath;
}

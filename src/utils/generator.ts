import fs from 'fs-extra';
import { join, dirname } from 'path';
import { existsSync } from 'fs';
import type { ProjectStructure } from './detect.js';
import type { ProviderConfig } from '../providers.js';

async function ensureDir(path: string): Promise<void> {
  await fs.ensureDir(path);
}

async function writeFile(path: string, content: string): Promise<boolean> {
  if (existsSync(path)) {
    return false;
  }
  await ensureDir(dirname(path));
  await fs.writeFile(path, content, 'utf-8');
  return true;
}

export async function generateMiddleware(structure: ProjectStructure): Promise<{ path: string; written: boolean }> {
  const content = `export { auth as middleware } from "./auth"

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*"],
}
`;

  const written = await writeFile(structure.middlewarePath, content);
  return { path: structure.middlewarePath, written };
}

export async function generateAuthRoute(structure: ProjectStructure): Promise<{ path: string; written: boolean }> {
  const authRoutePath = join(structure.appPath, 'api', 'auth', '[...nextauth]', 'route.ts');

  const content = `import { handlers } from "@/auth"

export const { GET, POST } = handlers
`;

  const written = await writeFile(authRoutePath, content);
  return { path: authRoutePath, written };
}

export async function generateAuthConfig(
  structure: ProjectStructure,
  providers: ProviderConfig[]
): Promise<{ path: string; written: boolean }> {
  const authConfigPath = structure.hasSrcDir
    ? join(structure.basePath, 'auth.ts')
    : join(process.cwd(), 'auth.ts');

  const importLines = providers
    .map(p => `import ${p.importName} from "${p.importPath}"`)
    .join('\n');

  const providerEntries = providers
    .map(p => `    ${p.configSnippet}`)
    .join(',\n');

  const content = `import NextAuth, { type DefaultSession } from "next-auth"
${importLines}

declare module "next-auth" {
  interface Session {
    user: {
      id: string
    } & DefaultSession["user"]
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
${providerEntries},
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.sub!
      return session
    },
  },
})
`;

  const written = await writeFile(authConfigPath, content);
  return { path: authConfigPath, written };
}

export async function generateUserProfile(structure: ProjectStructure): Promise<{ path: string; written: boolean }> {
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

  const written = await writeFile(userProfilePath, content);
  return { path: userProfilePath, written };
}

export async function generateLoginButton(
  structure: ProjectStructure,
  providers: ProviderConfig[]
): Promise<{ path: string; written: boolean }> {
  const loginButtonPath = join(structure.componentsPath, 'login-button.tsx');

  const hasMultipleOAuth = providers.filter(p => p.callbackPath !== null).length > 1;
  const hasCredentials = providers.some(p => p.id === 'credentials');
  const useGenericSignIn = hasMultipleOAuth || hasCredentials;

  const signInCall = useGenericSignIn
    ? 'signIn()'
    : `signIn("${providers.find(p => p.callbackPath !== null)?.id || 'google'}")`;

  const buttonLabel = useGenericSignIn
    ? 'Sign In'
    : `Sign in with ${providers.find(p => p.callbackPath !== null)?.name || 'Provider'}`;

  const content = `"use client"

import { signIn, signOut, useSession } from "next-auth/react"

export default function LoginButton() {
  const { data: session } = useSession()

  if (session) {
    return (
      <button
        onClick={() => signOut()}
        className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
      >
        Sign Out
      </button>
    )
  }

  return (
    <button
      onClick={() => ${signInCall}}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
    >
      ${buttonLabel}
    </button>
  )
}
`;

  const written = await writeFile(loginButtonPath, content);
  return { path: loginButtonPath, written };
}

export async function generateSessionProvider(structure: ProjectStructure): Promise<{ path: string; written: boolean }> {
  const providerPath = join(structure.componentsPath, 'session-provider.tsx');

  const content = `"use client"

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react"

export default function SessionProvider({ children }: { children: React.ReactNode }) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>
}
`;

  const written = await writeFile(providerPath, content);
  return { path: providerPath, written };
}

export async function generateEnvExample(
  cwd: string,
  providers: ProviderConfig[]
): Promise<{ path: string; written: boolean }> {
  const envExamplePath = join(cwd, '.env.local.example');

  let content = `# NextAuth Configuration
AUTH_SECRET=your-secret-key-here
`;

  for (const provider of providers) {
    if (provider.envVars.length > 0) {
      content += `\n# ${provider.name} OAuth\n`;
      for (const envVar of provider.envVars) {
        content += `${envVar.key}=${envVar.placeholder}\n`;
      }
    }
  }

  const written = await writeFile(envExamplePath, content);
  return { path: envExamplePath, written };
}

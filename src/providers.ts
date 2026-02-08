export interface EnvVar {
  key: string;
  description: string;
  placeholder: string;
}

export interface ProviderConfig {
  id: string;
  name: string;
  importName: string;
  importPath: string;
  envVars: EnvVar[];
  configSnippet: string;
  setupInstructions: string[];
  callbackPath: string | null;
}

export const PROVIDERS: Record<string, ProviderConfig> = {
  google: {
    id: 'google',
    name: 'Google',
    importName: 'Google',
    importPath: 'next-auth/providers/google',
    envVars: [
      { key: 'AUTH_GOOGLE_ID', description: 'Google OAuth Client ID', placeholder: 'your-google-client-id' },
      { key: 'AUTH_GOOGLE_SECRET', description: 'Google OAuth Client Secret', placeholder: 'your-google-client-secret' },
    ],
    configSnippet: `Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    })`,
    setupInstructions: [
      'Go to https://console.cloud.google.com/',
      'Create OAuth 2.0 credentials',
      'Add redirect URI: http://localhost:3000/api/auth/callback/google',
    ],
    callbackPath: '/api/auth/callback/google',
  },

  github: {
    id: 'github',
    name: 'GitHub',
    importName: 'GitHub',
    importPath: 'next-auth/providers/github',
    envVars: [
      { key: 'AUTH_GITHUB_ID', description: 'GitHub OAuth App Client ID', placeholder: 'your-github-client-id' },
      { key: 'AUTH_GITHUB_SECRET', description: 'GitHub OAuth App Client Secret', placeholder: 'your-github-client-secret' },
    ],
    configSnippet: `GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    })`,
    setupInstructions: [
      'Go to https://github.com/settings/developers',
      'Create a new OAuth App',
      'Set callback URL to: http://localhost:3000/api/auth/callback/github',
    ],
    callbackPath: '/api/auth/callback/github',
  },

  credentials: {
    id: 'credentials',
    name: 'Credentials (Email/Password)',
    importName: 'Credentials',
    importPath: 'next-auth/providers/credentials',
    envVars: [],
    configSnippet: `Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // TODO: Replace with your own authentication logic
        // This is a placeholder - connect to your database here
        if (!credentials?.email || !credentials?.password) return null

        // Example: validate against your database
        // const user = await db.user.findUnique({ where: { email: credentials.email } })
        // if (!user || !await bcrypt.compare(credentials.password, user.password)) return null

        return {
          id: "1",
          email: credentials.email as string,
          name: "User",
        }
      },
    })`,
    setupInstructions: [
      'Replace the authorize() function in auth.ts with your actual authentication logic',
      'Connect to your database to validate credentials',
      'Consider using bcrypt for password hashing',
    ],
    callbackPath: null,
  },
};

export function getAllProviders(): ProviderConfig[] {
  return [PROVIDERS.google, PROVIDERS.github, PROVIDERS.credentials];
}

export function getProviderConfigs(ids: string[]): ProviderConfig[] {
  return ids.map(id => {
    const config = PROVIDERS[id];
    if (!config) throw new Error(`Unknown provider: ${id}`);
    return config;
  });
}

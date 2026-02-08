import chalk from 'chalk';
import { execSync } from 'child_process';
import { detectProjectStructure, isNextProject, hasNextAuth, getPackageManager } from './utils/detect.js';
import {
  generateMiddleware,
  generateAuthRoute,
  generateAuthConfig,
  generateUserProfile,
  generateLoginButton,
  generateSessionProvider,
  generateEnvExample,
} from './utils/generator.js';
import { getProviderConfigs, PROVIDERS, type ProviderConfig } from './providers.js';

export async function setupNextAuth(
  cwd: string = process.cwd(),
  providerIds: string[] = ['google']
): Promise<void> {
  console.log(chalk.blue.bold('\n🚀 NextAuth CLI Setup\n'));

  // Validate provider IDs
  const invalidProviders = providerIds.filter(id => !(id in PROVIDERS));
  if (invalidProviders.length > 0) {
    console.error(chalk.red(`Unknown providers: ${invalidProviders.join(', ')}`));
    console.error(chalk.yellow(`Available: ${Object.keys(PROVIDERS).join(', ')}`));
    process.exit(1);
  }

  const providers = getProviderConfigs(providerIds);

  // Validate this is a Next.js project
  if (!isNextProject(cwd)) {
    console.error(chalk.red('Error: This does not appear to be a Next.js project.'));
    console.error(chalk.yellow('   Please ensure package.json exists with "next" as a dependency.'));
    process.exit(1);
  }

  // Detect project structure
  const structure = detectProjectStructure(cwd);

  console.log(chalk.cyan('📁 Detected project structure:'));
  console.log(chalk.gray(`   - Has src/ directory: ${structure.hasSrcDir ? 'Yes' : 'No'}`));
  console.log(chalk.gray(`   - Has app/ directory: ${structure.hasAppDir ? 'Yes' : 'No'}`));
  console.log(chalk.gray(`   - Providers: ${providers.map(p => p.name).join(', ')}`));

  if (!structure.hasAppDir) {
    console.error(chalk.red('\nError: App Router (app/ directory) not found.'));
    console.error(chalk.yellow('   This CLI currently only supports Next.js App Router.'));
    process.exit(1);
  }

  // Check and install next-auth if needed
  const nextAuthInstalled = hasNextAuth(cwd);
  if (!nextAuthInstalled) {
    const packageManager = getPackageManager(cwd);
    console.log(chalk.cyan('\n📦 Installing next-auth...\n'));

    const installCommands = {
      bun: 'bun add next-auth',
      npm: 'npm install next-auth',
      yarn: 'yarn add next-auth',
      pnpm: 'pnpm add next-auth',
    };

    try {
      const command = installCommands[packageManager];
      console.log(chalk.gray(`   Running: ${command}`));
      execSync(command, { cwd, stdio: 'inherit' });
      console.log(chalk.green('✓'), 'next-auth installed successfully\n');
    } catch {
      console.error(chalk.red('Failed to install next-auth automatically.'));
      console.error(chalk.yellow('   Please install it manually: bun add next-auth'));
      console.error(chalk.gray('   Continuing with file generation...\n'));
    }
  } else {
    console.log(chalk.green('\n✓ next-auth is already installed\n'));
  }

  console.log(chalk.cyan('📝 Generating files...\n'));

  const results: Array<{ label: string; path: string; status: 'created' | 'skipped' | 'error'; error?: string }> = [];

  const generators: Array<{ label: string; fn: () => Promise<{ path: string; written: boolean }> }> = [
    { label: 'Auth config', fn: () => generateAuthConfig(structure, providers) },
    { label: 'Middleware', fn: () => generateMiddleware(structure) },
    { label: 'API route', fn: () => generateAuthRoute(structure) },
    { label: 'SessionProvider', fn: () => generateSessionProvider(structure) },
    { label: 'UserProfile', fn: () => generateUserProfile(structure) },
    { label: 'LoginButton', fn: () => generateLoginButton(structure, providers) },
    { label: 'Env example', fn: () => generateEnvExample(cwd, providers) },
  ];

  for (const gen of generators) {
    try {
      const { path, written } = await gen.fn();
      const relativePath = path.replace(cwd, '.');
      if (written) {
        results.push({ label: gen.label, path: relativePath, status: 'created' });
        console.log(chalk.green('  ✓ created'), chalk.gray(relativePath));
      } else {
        results.push({ label: gen.label, path: relativePath, status: 'skipped' });
        console.log(chalk.yellow('  ⊘ skipped'), chalk.gray(relativePath), chalk.yellow('(already exists)'));
      }
    } catch (error) {
      results.push({ label: gen.label, path: '', status: 'error', error: String(error) });
      console.log(chalk.red('  ✗ failed'), chalk.gray(gen.label), chalk.red(String(error)));
    }
  }

  // Summary
  const created = results.filter(r => r.status === 'created').length;
  const skipped = results.filter(r => r.status === 'skipped').length;
  const errors = results.filter(r => r.status === 'error').length;

  if (errors > 0) {
    console.log(chalk.yellow(`\n⚠ Setup completed with issues: ${created} created, ${skipped} skipped, ${errors} failed\n`));
  } else {
    console.log(chalk.green.bold(`\n✨ Setup complete! ${created} files created${skipped > 0 ? `, ${skipped} skipped` : ''}\n`));
  }

  // Next steps
  console.log(chalk.cyan.bold('📋 Next Steps:\n'));

  console.log(chalk.yellow('1.'), 'Create a', chalk.cyan('.env.local'), 'file with your credentials:');
  console.log(chalk.gray('   cp .env.local.example .env.local'));
  console.log(chalk.gray('   Generate AUTH_SECRET: openssl rand -base64 32\n'));

  // Provider-specific setup instructions
  let step = 2;
  for (const provider of providers) {
    if (provider.setupInstructions.length > 0) {
      console.log(chalk.yellow(`${step}.`), `Set up ${chalk.cyan(provider.name)} provider:`);
      for (const instruction of provider.setupInstructions) {
        console.log(chalk.gray(`   - ${instruction}`));
      }
      console.log();
      step++;
    }
  }

  console.log(chalk.yellow(`${step}.`), 'Add', chalk.cyan('SessionProvider'), 'to your root layout:');
  console.log(chalk.gray('   Import SessionProvider from your components and wrap {children}\n'));
  step++;

  console.log(chalk.yellow(`${step}.`), 'Start your development server:');
  console.log(chalk.gray('   bun run dev\n'));

  console.log(chalk.cyan.bold('📚 Components created:'));
  console.log(chalk.gray('   - <SessionProvider /> - Wrap your app for client-side session access'));
  console.log(chalk.gray('   - <LoginButton />     - Sign in/out button'));
  console.log(chalk.gray('   - <UserProfile />     - Display user session info\n'));

  console.log(chalk.cyan.bold('🔒 Protected routes:'));
  console.log(chalk.gray('   - /dashboard/*'));
  console.log(chalk.gray('   - /profile/*\n'));
}

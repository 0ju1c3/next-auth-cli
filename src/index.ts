import chalk from 'chalk';
import { execSync } from 'child_process';
import { detectProjectStructure, isNextProject, hasNextAuth, getPackageManager } from './utils/detect.js';
import {
  generateMiddleware,
  generateAuthRoute,
  generateAuthConfig,
  generateUserProfile,
  generateLoginButton,
  generateEnvExample,
  generateAuthTypes,
} from './utils/generator.js';

export async function setupNextAuth(cwd: string = process.cwd()): Promise<void> {
  console.log(chalk.blue.bold('\n🚀 NextAuth CLI Setup\n'));

  // Validate this is a Next.js project
  if (!isNextProject(cwd)) {
    console.error(chalk.red('❌ Error: This does not appear to be a Next.js project.'));
    console.error(chalk.yellow('   Please ensure package.json exists with "next" as a dependency.'));
    process.exit(1);
  }

  // Detect project structure
  const structure = detectProjectStructure(cwd);

  console.log(chalk.cyan('📁 Detected project structure:'));
  console.log(chalk.gray(`   - Has src/ directory: ${structure.hasSrcDir ? 'Yes' : 'No'}`));
  console.log(chalk.gray(`   - Has app/ directory: ${structure.hasAppDir ? 'Yes' : 'No'}`));

  if (!structure.hasAppDir) {
    console.error(chalk.red('\n❌ Error: App Router (app/ directory) not found.'));
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
    } catch (error) {
      console.error(chalk.red('❌ Failed to install next-auth automatically.'));
      console.error(chalk.yellow('   Please install it manually: bun add next-auth'));
      console.error(chalk.gray('   Continuing with file generation...\n'));
    }
  } else {
    console.log(chalk.green('\n✓ next-auth is already installed\n'));
  }

  console.log(chalk.cyan('📝 Generating files...\n'));

  try {
    // Generate auth configuration
    const authConfigPath = await generateAuthConfig(structure);
    console.log(chalk.green('✓'), `Created ${chalk.gray(authConfigPath.replace(cwd, '.'))}`);

    // Generate middleware
    const middlewarePath = await generateMiddleware(structure);
    console.log(chalk.green('✓'), `Created ${chalk.gray(middlewarePath.replace(cwd, '.'))}`);

    // Generate auth route
    const authRoutePath = await generateAuthRoute(structure);
    console.log(chalk.green('✓'), `Created ${chalk.gray(authRoutePath.replace(cwd, '.'))}`);

    // Generate components
    const userProfilePath = await generateUserProfile(structure);
    console.log(chalk.green('✓'), `Created ${chalk.gray(userProfilePath.replace(cwd, '.'))}`);

    const loginButtonPath = await generateLoginButton(structure);
    console.log(chalk.green('✓'), `Created ${chalk.gray(loginButtonPath.replace(cwd, '.'))}`);

    // Generate .env.local.example
    const envExamplePath = await generateEnvExample(cwd);
    console.log(chalk.green('✓'), `Created ${chalk.gray(envExamplePath.replace(cwd, '.'))}`);

    // Generate auth type declarations
    const authTypesPath = await generateAuthTypes(cwd);
    console.log(chalk.green('✓'), `Created ${chalk.gray(authTypesPath.replace(cwd, '.'))}`);

    // Success message with next steps
    console.log(chalk.green.bold('\n✨ NextAuth setup completed successfully!\n'));

    console.log(chalk.cyan.bold('📋 Next Steps:\n'));

    console.log(chalk.yellow('1.'), 'Create a', chalk.cyan('.env.local'), 'file with your credentials:');
    console.log(chalk.gray('   cp .env.local.example .env.local\n'));

    console.log(chalk.yellow('2.'), 'Get Google OAuth credentials:');
    console.log(chalk.gray('   - Go to https://console.cloud.google.com/'));
    console.log(chalk.gray('   - Create a new project or select an existing one'));
    console.log(chalk.gray('   - Enable Google+ API'));
    console.log(chalk.gray('   - Create OAuth 2.0 credentials'));
    console.log(chalk.gray('   - Add authorized redirect URI: http://localhost:3000/api/auth/callback/google\n'));

    console.log(chalk.yellow('3.'), 'Add', chalk.cyan('SessionProvider'), 'to your root layout:');
    console.log(chalk.gray('   Update your app/layout.tsx to wrap children with SessionProvider\n'));

    console.log(chalk.yellow('4.'), 'Start your development server:');
    console.log(chalk.gray('   bun run dev\n'));

    console.log(chalk.cyan.bold('📚 Components created:'));
    console.log(chalk.gray('   - <LoginButton /> - Sign in/out button'));
    console.log(chalk.gray('   - <UserProfile /> - Display user session info\n'));

    console.log(chalk.cyan.bold('🔒 Protected routes:'));
    console.log(chalk.gray('   - /dashboard/*'));
    console.log(chalk.gray('   - /profile/*\n'));

  } catch (error) {
    console.error(chalk.red('\n❌ Error during setup:'), error);
    process.exit(1);
  }
}

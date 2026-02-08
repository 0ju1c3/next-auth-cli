#!/usr/bin/env node

import { intro, multiselect, isCancel, cancel } from '@clack/prompts';
import chalk from 'chalk';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { setupNextAuth } from './index.js';
import { getAllProviders, PROVIDERS } from './providers.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

function getVersion(): string {
  try {
    const pkg = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf-8'));
    return pkg.version;
  } catch {
    return 'unknown';
  }
}

function printHelp(): void {
  console.log(`
${chalk.blue.bold('next-auth-setup')} - Set up NextAuth.js in your Next.js project

${chalk.cyan('Usage:')}
  next-auth-setup [options]

${chalk.cyan('Options:')}
  -h, --help       Show this help message
  -v, --version    Show version number
  --providers      Comma-separated provider list (skip interactive selection)
                   Available: ${Object.keys(PROVIDERS).join(', ')}

${chalk.cyan('Examples:')}
  next-auth-setup                              Interactive mode
  next-auth-setup --providers google           Google only
  next-auth-setup --providers google,github    Google + GitHub
`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.includes('-h') || args.includes('--help')) {
    printHelp();
    process.exit(0);
  }

  if (args.includes('-v') || args.includes('--version')) {
    console.log(getVersion());
    process.exit(0);
  }

  const providersIndex = args.indexOf('--providers');
  let selectedProviderIds: string[] | undefined;

  if (providersIndex !== -1 && args[providersIndex + 1]) {
    selectedProviderIds = args[providersIndex + 1].split(',').map(s => s.trim());

    const invalid = selectedProviderIds.filter(id => !(id in PROVIDERS));
    if (invalid.length > 0) {
      console.error(chalk.red(`Unknown providers: ${invalid.join(', ')}`));
      console.error(chalk.yellow(`Available: ${Object.keys(PROVIDERS).join(', ')}`));
      process.exit(1);
    }
  }

  if (!selectedProviderIds) {
    intro(chalk.blue.bold('NextAuth.js Setup'));

    const allProviders = getAllProviders();

    const selected = await multiselect({
      message: 'Which authentication providers would you like to set up?',
      options: allProviders.map(p => ({
        value: p.id,
        label: p.name,
        hint: p.id === 'credentials' ? 'email/password - requires custom logic' : undefined,
      })),
      required: true,
    });

    if (isCancel(selected)) {
      cancel('Setup cancelled.');
      process.exit(0);
    }

    selectedProviderIds = selected as string[];
  }

  await setupNextAuth(process.cwd(), selectedProviderIds);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

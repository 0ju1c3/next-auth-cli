import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';

export interface ProjectStructure {
  hasSrcDir: boolean;
  hasAppDir: boolean;
  basePath: string;
  appPath: string;
  componentsPath: string;
  middlewarePath: string;
}

/**
 * Detects the Next.js project structure
 * @param cwd - Current working directory (usually process.cwd())
 * @returns ProjectStructure object with paths
 */
export function detectProjectStructure(cwd: string): ProjectStructure {
  const hasSrcDir = existsSync(join(cwd, 'src'));
  const hasAppDir = hasSrcDir
    ? existsSync(join(cwd, 'src', 'app'))
    : existsSync(join(cwd, 'app'));

  const basePath = hasSrcDir ? join(cwd, 'src') : cwd;
  const appPath = join(basePath, 'app');
  const componentsPath = hasSrcDir
    ? join(cwd, 'src', 'components')
    : join(cwd, 'components');
  const middlewarePath = hasSrcDir
    ? join(cwd, 'src', 'middleware.ts')
    : join(cwd, 'middleware.ts');

  return {
    hasSrcDir,
    hasAppDir,
    basePath,
    appPath,
    componentsPath,
    middlewarePath,
  };
}

/**
 * Validates that this is a Next.js project
 * @param cwd - Current working directory
 * @returns true if package.json exists with next dependency
 */
export function isNextProject(cwd: string): boolean {
  const packageJsonPath = join(cwd, 'package.json');

  if (!existsSync(packageJsonPath)) {
    return false;
  }

  try {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    return !!(packageJson.dependencies?.next || packageJson.devDependencies?.next);
  } catch {
    return false;
  }
}

/**
 * Checks if next-auth is already installed
 * @param cwd - Current working directory
 * @returns true if next-auth is in dependencies or devDependencies
 */
export function hasNextAuth(cwd: string): boolean {
  const packageJsonPath = join(cwd, 'package.json');

  if (!existsSync(packageJsonPath)) {
    return false;
  }

  try {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    return !!(packageJson.dependencies?.['next-auth'] || packageJson.devDependencies?.['next-auth']);
  } catch {
    return false;
  }
}

/**
 * Detects the package manager used in the project
 * @param cwd - Current working directory
 * @returns Package manager type: 'bun' | 'pnpm' | 'yarn' | 'npm'
 */
export function getPackageManager(cwd: string): 'bun' | 'pnpm' | 'yarn' | 'npm' {
  let dir = cwd;
  while (dir !== dirname(dir)) {
    if (existsSync(join(dir, 'bun.lock')) || existsSync(join(dir, 'bun.lockb'))) return 'bun';
    if (existsSync(join(dir, 'pnpm-lock.yaml'))) return 'pnpm';
    if (existsSync(join(dir, 'yarn.lock'))) return 'yarn';
    if (existsSync(join(dir, 'package-lock.json'))) return 'npm';
    dir = dirname(dir);
  }
  return 'npm';
}

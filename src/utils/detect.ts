import { existsSync } from 'fs';
import { join } from 'path';

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
  const componentsPath = join(cwd, 'components');
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
    const packageJson = require(packageJsonPath);
    return !!(packageJson.dependencies?.next || packageJson.devDependencies?.next);
  } catch {
    return false;
  }
}

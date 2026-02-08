import { describe, expect, test } from 'bun:test';
import { getPackageManager, isNextProject, detectProjectStructure } from '../utils/detect';
import { mkdtempSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

describe('getPackageManager', () => {
  test('detects bun from bun.lock', () => {
    const dir = mkdtempSync(join(tmpdir(), 'test-'));
    writeFileSync(join(dir, 'bun.lock'), '');
    expect(getPackageManager(dir)).toBe('bun');
  });

  test('detects bun from bun.lockb (legacy)', () => {
    const dir = mkdtempSync(join(tmpdir(), 'test-'));
    writeFileSync(join(dir, 'bun.lockb'), '');
    expect(getPackageManager(dir)).toBe('bun');
  });

  test('detects pnpm', () => {
    const dir = mkdtempSync(join(tmpdir(), 'test-'));
    writeFileSync(join(dir, 'pnpm-lock.yaml'), '');
    expect(getPackageManager(dir)).toBe('pnpm');
  });

  test('detects yarn', () => {
    const dir = mkdtempSync(join(tmpdir(), 'test-'));
    writeFileSync(join(dir, 'yarn.lock'), '');
    expect(getPackageManager(dir)).toBe('yarn');
  });

  test('detects npm', () => {
    const dir = mkdtempSync(join(tmpdir(), 'test-'));
    writeFileSync(join(dir, 'package-lock.json'), '');
    expect(getPackageManager(dir)).toBe('npm');
  });

  test('defaults to npm when no lock file found', () => {
    const dir = mkdtempSync(join(tmpdir(), 'test-'));
    expect(getPackageManager(dir)).toBe('npm');
  });

  test('walks up directories to find lock file (monorepo)', () => {
    const root = mkdtempSync(join(tmpdir(), 'test-'));
    writeFileSync(join(root, 'bun.lock'), '');
    const nested = join(root, 'apps', 'my-app');
    mkdirSync(nested, { recursive: true });
    expect(getPackageManager(nested)).toBe('bun');
  });
});

describe('isNextProject', () => {
  test('returns true for valid Next.js project', () => {
    const dir = mkdtempSync(join(tmpdir(), 'test-'));
    writeFileSync(join(dir, 'package.json'), JSON.stringify({
      dependencies: { next: '14.0.0' }
    }));
    expect(isNextProject(dir)).toBe(true);
  });

  test('returns true when next is in devDependencies', () => {
    const dir = mkdtempSync(join(tmpdir(), 'test-'));
    writeFileSync(join(dir, 'package.json'), JSON.stringify({
      devDependencies: { next: '14.0.0' }
    }));
    expect(isNextProject(dir)).toBe(true);
  });

  test('returns false when next is not a dependency', () => {
    const dir = mkdtempSync(join(tmpdir(), 'test-'));
    writeFileSync(join(dir, 'package.json'), JSON.stringify({
      dependencies: { react: '18.0.0' }
    }));
    expect(isNextProject(dir)).toBe(false);
  });

  test('returns false when no package.json exists', () => {
    const dir = mkdtempSync(join(tmpdir(), 'test-'));
    expect(isNextProject(dir)).toBe(false);
  });
});

describe('detectProjectStructure', () => {
  test('detects src/app structure', () => {
    const dir = mkdtempSync(join(tmpdir(), 'test-'));
    mkdirSync(join(dir, 'src', 'app'), { recursive: true });
    const structure = detectProjectStructure(dir);
    expect(structure.hasSrcDir).toBe(true);
    expect(structure.hasAppDir).toBe(true);
    expect(structure.componentsPath).toContain('src/components');
  });

  test('detects root app structure', () => {
    const dir = mkdtempSync(join(tmpdir(), 'test-'));
    mkdirSync(join(dir, 'app'), { recursive: true });
    const structure = detectProjectStructure(dir);
    expect(structure.hasSrcDir).toBe(false);
    expect(structure.hasAppDir).toBe(true);
    expect(structure.componentsPath).not.toContain('src');
  });

  test('detects no app directory', () => {
    const dir = mkdtempSync(join(tmpdir(), 'test-'));
    const structure = detectProjectStructure(dir);
    expect(structure.hasAppDir).toBe(false);
  });
});

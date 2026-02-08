import { describe, expect, test } from 'bun:test';
import { getAllProviders, getProviderConfigs, PROVIDERS } from '../providers';

describe('providers', () => {
  test('getAllProviders returns all three providers', () => {
    const providers = getAllProviders();
    expect(providers).toHaveLength(3);
    expect(providers.map(p => p.id)).toEqual(['google', 'github', 'credentials']);
  });

  test('getProviderConfigs returns matching configs', () => {
    const configs = getProviderConfigs(['google', 'github']);
    expect(configs).toHaveLength(2);
    expect(configs[0].id).toBe('google');
    expect(configs[1].id).toBe('github');
  });

  test('getProviderConfigs throws for unknown provider', () => {
    expect(() => getProviderConfigs(['unknown'])).toThrow('Unknown provider: unknown');
  });

  test('each provider has required fields', () => {
    for (const provider of Object.values(PROVIDERS)) {
      expect(provider.id).toBeTruthy();
      expect(provider.name).toBeTruthy();
      expect(provider.importName).toBeTruthy();
      expect(provider.importPath).toBeTruthy();
      expect(provider.configSnippet).toBeTruthy();
      expect(Array.isArray(provider.envVars)).toBe(true);
      expect(Array.isArray(provider.setupInstructions)).toBe(true);
    }
  });

  test('OAuth providers have env vars, credentials does not', () => {
    expect(PROVIDERS.google.envVars.length).toBeGreaterThan(0);
    expect(PROVIDERS.github.envVars.length).toBeGreaterThan(0);
    expect(PROVIDERS.credentials.envVars).toHaveLength(0);
  });

  test('OAuth providers have callback paths, credentials does not', () => {
    expect(PROVIDERS.google.callbackPath).toBeTruthy();
    expect(PROVIDERS.github.callbackPath).toBeTruthy();
    expect(PROVIDERS.credentials.callbackPath).toBeNull();
  });
});

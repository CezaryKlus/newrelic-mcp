import type { Mock } from 'vitest';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { __test__, NewRelicClient } from '../../../src/client/newrelic-client';

const originalFetch = global.fetch;

beforeAll(() => {
  global.fetch = vi.fn();
});

afterEach(() => {
  vi.clearAllMocks();
  delete process.env.NEW_RELIC_REGION;
});

afterAll(() => {
  global.fetch = originalFetch;
});

describe('NewRelicClient region endpoint selection', () => {
  beforeEach(() => {
    process.env.NEW_RELIC_API_KEY = 'test-api-key';
    process.env.NEW_RELIC_ACCOUNT_ID = '123456';
  });

  it('uses US endpoint by default when NEW_RELIC_REGION is not set', async () => {
    (global.fetch as unknown as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { actor: { user: { id: '1', email: 'a@b.c' } } } }),
    });
    const client = new NewRelicClient();
    await client.validateCredentials();
    expect((global.fetch as Mock).mock.calls[0][0]).toBe('https://api.newrelic.com/graphql');
  });

  it('uses EU endpoint when NEW_RELIC_REGION=EU', async () => {
    process.env.NEW_RELIC_REGION = 'EU';
    (global.fetch as unknown as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { actor: { user: { id: '1', email: 'a@b.c' } } } }),
    });
    const client = new NewRelicClient();
    await client.validateCredentials();
    expect((global.fetch as Mock).mock.calls[0][0]).toBe('https://api.eu.newrelic.com/graphql');
  });

  it('falls back to US for invalid region value', async () => {
    process.env.NEW_RELIC_REGION = 'APAC';
    (global.fetch as unknown as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { actor: { user: { id: '1', email: 'a@b.c' } } } }),
    });
    const client = new NewRelicClient();
    await client.validateCredentials();
    expect((global.fetch as Mock).mock.calls[0][0]).toBe('https://api.newrelic.com/graphql');
  });

  it('internal helper returns correct URL', () => {
    expect(__test__.nerdGraphUrlForRegion('US')).toBe('https://api.newrelic.com/graphql');
    expect(__test__.nerdGraphUrlForRegion('EU')).toBe('https://api.eu.newrelic.com/graphql');
  });
});

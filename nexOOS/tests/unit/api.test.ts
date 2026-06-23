describe('buildApiUrl', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.resetModules();
    delete process.env.NEXT_PUBLIC_OOS_FRONTEND_API_BASE_URL;
  });

  it('uses the default local API base URL', async () => {
    const { buildApiUrl } = await import('../../src/lib/api');

    expect(buildApiUrl('/api/auth/login')).toBe('http://localhost:3001/api/auth/login');
    expect(buildApiUrl('api/cart')).toBe('http://localhost:3001/api/cart');
  });

  it('preserves absolute URLs', async () => {
    const { buildApiUrl } = await import('../../src/lib/api');

    expect(buildApiUrl('https://example.com/health')).toBe('https://example.com/health');
  });

  it('uses and normalizes NEXT_PUBLIC_OOS_FRONTEND_API_BASE_URL when provided', async () => {
    process.env.NEXT_PUBLIC_OOS_FRONTEND_API_BASE_URL = ' https://api.greenovate.test/ ';

    const { buildApiUrl } = await import('../../src/lib/api');

    expect(buildApiUrl('/api/auth/login')).toBe('https://api.greenovate.test/api/auth/login');
    expect(buildApiUrl('api/cart')).toBe('https://api.greenovate.test/api/cart');
  });
});

describe('fetchJson', () => {
  afterEach(() => {
    jest.resetModules();
    jest.restoreAllMocks();
  });

  it('returns parsed JSON for successful responses', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    );

    const { fetchJson } = await import('../../src/lib/api');

    await expect(fetchJson('/api/health')).resolves.toEqual({ ok: true });
  });

  it('throws ApiRequestError with JSON error messages', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ error: 'Nope' }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      })
    );

    const { ApiRequestError, fetchJson } = await import('../../src/lib/api');

    const request = fetchJson('/api/fail');

    await expect(request).rejects.toMatchObject({
      name: 'ApiRequestError',
      message: 'Nope',
      status: 400,
      payload: { error: 'Nope' },
    });
    await expect(request).rejects.toBeInstanceOf(ApiRequestError);
  });

  it('uses message payloads and status fallbacks for failed responses', async () => {
    const fetchMock = jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ message: 'Try again' }), {
          status: 503,
          headers: { 'content-type': 'application/json' },
        })
      )
      .mockResolvedValueOnce(new Response('', { status: 418 }));

    const { fetchJson } = await import('../../src/lib/api');

    await expect(fetchJson('/api/message')).rejects.toThrow('Try again');
    await expect(fetchJson('/api/teapot')).rejects.toThrow('Request failed with status 418');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

describe('fetchJsonWithRetry', () => {
  afterEach(() => {
    jest.resetModules();
    jest.restoreAllMocks();
  });

  it('retries retryable API errors and returns the later success', async () => {
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify({ error: 'Starting' }), {
        status: 503,
        headers: { 'content-type': 'application/json' },
      }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ready: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }));

    const { fetchJsonWithRetry } = await import('../../src/lib/api');

    await expect(
      fetchJsonWithRetry('/api/ready', undefined, { attempts: 2, initialDelayMs: 0 })
    ).resolves.toEqual({ ready: true });
  });

  it('retries network errors and stops on non-retryable API errors', async () => {
    const fetchMock = jest
      .spyOn(global, 'fetch')
      .mockRejectedValueOnce(new TypeError('network down'))
      .mockResolvedValueOnce(new Response(JSON.stringify({ message: 'Missing' }), {
        status: 404,
        headers: { 'content-type': 'application/json' },
      }));

    const { fetchJsonWithRetry } = await import('../../src/lib/api');

    await expect(
      fetchJsonWithRetry('/api/missing', undefined, { attempts: 3, initialDelayMs: 0 })
    ).rejects.toThrow('Missing');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('does not retry aborted requests', async () => {
    const abortError = new Error('aborted');
    abortError.name = 'AbortError';
    const fetchMock = jest.spyOn(global, 'fetch').mockRejectedValue(abortError);

    const { fetchJsonWithRetry } = await import('../../src/lib/api');

    await expect(
      fetchJsonWithRetry('/api/abort', undefined, { attempts: 3, initialDelayMs: 0 })
    ).rejects.toThrow('aborted');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

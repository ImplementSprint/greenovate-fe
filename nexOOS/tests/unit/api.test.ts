describe('buildApiUrl', () => {
  const originalEnv = process.env.NEXT_PUBLIC_API_BASE_URL;

  afterEach(() => {
    process.env.NEXT_PUBLIC_API_BASE_URL = originalEnv;
    jest.resetModules();
  });

  it('uses the configured base url and normalizes leading slashes', async () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = 'https://api.example.com/';
    const { buildApiUrl } = await import('../../src/lib/api');

    expect(buildApiUrl('orders')).toBe('https://api.example.com/orders');
    expect(buildApiUrl('/products')).toBe('https://api.example.com/products');
  });

  it('returns absolute urls unchanged', async () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = 'https://api.example.com/';
    const { buildApiUrl } = await import('../../src/lib/api');

    expect(buildApiUrl('https://other.example.com/health')).toBe(
      'https://other.example.com/health'
    );
  });

  it('falls back to localhost when no base url is configured', async () => {
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
    const { buildApiUrl } = await import('../../src/lib/api');

    expect(buildApiUrl('/status')).toBe('http://localhost:4000/status');
  });
});

const mockAppendFile = jest.fn();

jest.mock('fs/promises', () => ({
  appendFile: mockAppendFile,
}));

jest.mock('node:fs/promises', () => ({
  appendFile: mockAppendFile,
}));

describe('trackSearchQuery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('skips blank queries', async () => {
    const { trackSearchQuery } = await import('../../src/lib/search-analytics');

    await trackSearchQuery('   ', 'shop');
    expect(mockAppendFile).not.toHaveBeenCalled();
  });

  it('appends trimmed queries to the analytics log', async () => {
    const { trackSearchQuery } = await import('../../src/lib/search-analytics');

    await trackSearchQuery(' vitamin c ', 'navbar');

    expect(mockAppendFile).toHaveBeenCalledWith(
      expect.stringContaining('search-analytics.log'),
      expect.stringContaining('"query":"vitamin c"'),
      'utf8'
    );
  });
});

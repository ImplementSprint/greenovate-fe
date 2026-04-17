jest.mock('fs/promises', () => ({
  appendFile: jest.fn(),
}));

import { appendFile } from 'fs/promises';
import { trackSearchQuery } from '../../src/lib/search-analytics';

describe('trackSearchQuery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does nothing for blank queries', async () => {
    await trackSearchQuery('   ', 'homepage');

    expect(appendFile).not.toHaveBeenCalled();
  });

  it('appends a JSON log entry for a valid query', async () => {
    await trackSearchQuery(' vitamins ', 'homepage');

    expect(appendFile).toHaveBeenCalledTimes(1);
    const [logPath, payload, encoding] = (appendFile as jest.Mock).mock.calls[0];

    expect(logPath).toContain('search-analytics.log');
    expect(encoding).toBe('utf8');

    const entry = JSON.parse(String(payload).trim());
    expect(entry).toMatchObject({
      query: 'vitamins',
      source: 'homepage',
    });
    expect(typeof entry.timestamp).toBe('string');
  });
});

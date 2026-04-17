import {
  normalizeDateForInput,
  normalizeDateForStorage,
} from '../../src/lib/date';

describe('date helpers', () => {
  it('returns an empty string for empty values', () => {
    expect(normalizeDateForInput()).toBe('');
    expect(normalizeDateForInput(null)).toBe('');
  });

  it('keeps ISO date strings unchanged', () => {
    expect(normalizeDateForInput('2026-04-17')).toBe('2026-04-17');
  });

  it('converts slash-formatted dates into ISO format', () => {
    expect(normalizeDateForInput('4/7/2026')).toBe('2026-04-07');
  });

  it('parses other date strings when possible', () => {
    expect(normalizeDateForInput('April 17, 2026')).toBe('2026-04-17');
  });

  it('returns an empty string for invalid dates', () => {
    expect(normalizeDateForInput('not-a-date')).toBe('');
  });

  it('returns null for invalid storage values', () => {
    expect(normalizeDateForStorage('not-a-date')).toBeNull();
  });

  it('returns normalized values for storage', () => {
    expect(normalizeDateForStorage('4/7/2026')).toBe('2026-04-07');
  });
});

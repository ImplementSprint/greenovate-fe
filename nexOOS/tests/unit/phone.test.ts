import {
  PH_PHONE_MESSAGE,
  isValidPhilippinePhone,
  normalizePhilippinePhone,
} from '../../src/lib/phone';

describe('phone helpers', () => {
  it('exports the validation guidance message', () => {
    expect(PH_PHONE_MESSAGE).toContain('Philippine mobile number');
  });

  it('normalizes local mobile numbers to +63 format', () => {
    expect(normalizePhilippinePhone('09123456789')).toBe('+639123456789');
  });

  it('normalizes 639 numbers and preserves +639 numbers', () => {
    expect(normalizePhilippinePhone('639123456789')).toBe('+639123456789');
    expect(normalizePhilippinePhone('+639123456789')).toBe('+639123456789');
  });

  it('strips punctuation before validating', () => {
    expect(normalizePhilippinePhone('+63 912-345-6789')).toBe('+639123456789');
  });

  it('returns null for invalid values', () => {
    expect(normalizePhilippinePhone('12345')).toBeNull();
    expect(isValidPhilippinePhone('12345')).toBe(false);
  });

  it('returns true for valid values', () => {
    expect(isValidPhilippinePhone('09123456789')).toBe(true);
  });
});

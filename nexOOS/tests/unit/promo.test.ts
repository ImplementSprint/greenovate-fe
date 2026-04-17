let mockMaybeSingle: jest.Mock;
let mockEq: jest.Mock;
let mockSelect: jest.Mock;
let mockFrom: jest.Mock;

jest.mock('../../src/lib/second-supabase', () => ({
  secondSupabaseAdmin: {
    from: (...args: unknown[]) => mockFrom(...args),
  },
}));

beforeEach(() => {
  mockMaybeSingle = jest.fn();
  mockEq = jest.fn(() => ({ maybeSingle: mockMaybeSingle }));
  mockSelect = jest.fn(() => ({ eq: mockEq }));
  mockFrom = jest.fn(() => ({ select: mockSelect }));
});

import {
  normalizePromoCode,
  validatePromoCode,
} from '../../src/lib/promo';

describe('promo helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('normalizes promo codes', () => {
    expect(normalizePromoCode(' save10 ')).toBe('SAVE10');
  });

  it('returns a validation message when the code is blank', async () => {
    await expect(validatePromoCode('   ', 100)).resolves.toEqual({
      valid: false,
      normalizedCode: '',
      message: 'Enter a promo code.',
    });
  });

  it('throws when promo validation fails upstream', async () => {
    mockMaybeSingle.mockResolvedValueOnce({ data: null, error: { message: 'boom' } });

    await expect(validatePromoCode('SAVE10', 100)).rejects.toThrow(
      'Failed to validate promo code.'
    );
  });

  it('returns not found when the promo does not exist', async () => {
    mockMaybeSingle.mockResolvedValueOnce({ data: null, error: null });

    await expect(validatePromoCode('SAVE10', 100)).resolves.toEqual({
      valid: false,
      normalizedCode: 'SAVE10',
      message: 'Promo code not found.',
    });
  });

  it('rejects inactive promos', async () => {
    mockMaybeSingle.mockResolvedValueOnce({
      data: {
        id: 1,
        code: 'SAVE10',
        description: null,
        discount_type: 'fixed',
        discount_value: 10,
        min_subtotal: 0,
        max_discount: null,
        starts_at: null,
        ends_at: null,
        usage_limit: null,
        times_used: 0,
        is_active: false,
      },
      error: null,
    });

    await expect(validatePromoCode('SAVE10', 100)).resolves.toEqual({
      valid: false,
      normalizedCode: 'SAVE10',
      message: 'This promo code is inactive.',
    });
  });

  it('rejects promos that are not active yet', async () => {
    mockMaybeSingle.mockResolvedValueOnce({
      data: {
        id: 4,
        code: 'LATER',
        description: null,
        discount_type: 'fixed',
        discount_value: 10,
        min_subtotal: 0,
        max_discount: null,
        starts_at: '2099-01-01T00:00:00.000Z',
        ends_at: null,
        usage_limit: null,
        times_used: 0,
        is_active: true,
      },
      error: null,
    });

    await expect(validatePromoCode('LATER', 100)).resolves.toEqual({
      valid: false,
      normalizedCode: 'LATER',
      message: 'This promo code is not active yet.',
    });
  });

  it('rejects expired promos', async () => {
    mockMaybeSingle.mockResolvedValueOnce({
      data: {
        id: 5,
        code: 'OLD',
        description: null,
        discount_type: 'fixed',
        discount_value: 10,
        min_subtotal: 0,
        max_discount: null,
        starts_at: null,
        ends_at: '2000-01-01T00:00:00.000Z',
        usage_limit: null,
        times_used: 0,
        is_active: true,
      },
      error: null,
    });

    await expect(validatePromoCode('OLD', 100)).resolves.toEqual({
      valid: false,
      normalizedCode: 'OLD',
      message: 'This promo code has expired.',
    });
  });

  it('rejects promos that have reached their usage limit', async () => {
    mockMaybeSingle.mockResolvedValueOnce({
      data: {
        id: 6,
        code: 'LIMIT',
        description: null,
        discount_type: 'fixed',
        discount_value: 10,
        min_subtotal: 0,
        max_discount: null,
        starts_at: null,
        ends_at: null,
        usage_limit: 2,
        times_used: 2,
        is_active: true,
      },
      error: null,
    });

    await expect(validatePromoCode('LIMIT', 100)).resolves.toEqual({
      valid: false,
      normalizedCode: 'LIMIT',
      message: 'This promo code has reached its usage limit.',
    });
  });

  it('applies a capped percentage discount', async () => {
    mockMaybeSingle.mockResolvedValueOnce({
      data: {
        id: 2,
        code: 'SAVE20',
        description: 'Twenty percent off',
        discount_type: 'percent',
        discount_value: 20,
        min_subtotal: 100,
        max_discount: 30,
        starts_at: null,
        ends_at: null,
        usage_limit: null,
        times_used: 1,
        is_active: true,
      },
      error: null,
    });

    const result = await validatePromoCode('save20', 200);

    expect(result).toEqual({
      valid: true,
      promo: expect.objectContaining({
        code: 'SAVE20',
      }),
      normalizedCode: 'SAVE20',
      discountAmount: 30,
      message: 'SAVE20 applied: 20% off.',
    });
  });

  it('applies a fixed discount and caps it at the subtotal', async () => {
    mockMaybeSingle.mockResolvedValueOnce({
      data: {
        id: 7,
        code: 'LESS500',
        description: null,
        discount_type: 'fixed',
        discount_value: 500,
        min_subtotal: 0,
        max_discount: null,
        starts_at: null,
        ends_at: null,
        usage_limit: null,
        times_used: 0,
        is_active: true,
      },
      error: null,
    });

    await expect(validatePromoCode('LESS500', 120)).resolves.toEqual({
      valid: true,
      promo: expect.objectContaining({
        code: 'LESS500',
      }),
      normalizedCode: 'LESS500',
      discountAmount: 120,
      message: 'LESS500 applied: P500.00 off.',
    });
  });

  it('rejects promos that do not meet the minimum subtotal', async () => {
    mockMaybeSingle.mockResolvedValueOnce({
      data: {
        id: 3,
        code: 'LESS50',
        description: null,
        discount_type: 'fixed',
        discount_value: 50,
        min_subtotal: 500,
        max_discount: null,
        starts_at: null,
        ends_at: null,
        usage_limit: null,
        times_used: 0,
        is_active: true,
      },
      error: null,
    });

    await expect(validatePromoCode('LESS50', 100)).resolves.toEqual({
      valid: false,
      normalizedCode: 'LESS50',
      message: 'Minimum subtotal for this promo is P500.00.',
    });
  });

  it('rejects promos that produce no discount after normalization', async () => {
    mockMaybeSingle.mockResolvedValueOnce({
      data: {
        id: 8,
        code: 'ZERO',
        description: null,
        discount_type: 'fixed',
        discount_value: 0,
        min_subtotal: 0,
        max_discount: null,
        starts_at: null,
        ends_at: null,
        usage_limit: null,
        times_used: 0,
        is_active: true,
      },
      error: null,
    });

    await expect(validatePromoCode('ZERO', Number.NaN)).resolves.toEqual({
      valid: false,
      normalizedCode: 'ZERO',
      message: 'This promo code does not apply to the current cart.',
    });
  });
});

import { describe, expect, test } from 'vitest';

import {
  PHARMACY_FALLBACK_IMAGE,
  isTestRewardName,
  normalizeRewardDescription,
  normalizeRewardDisplayName,
  normalizeRewardImageUrl,
  normalizeTransactionDescription,
} from '../../src/app/lib/reward-display';

describe('reward display helpers', () => {
  test('recognizes seeded API test rewards', () => {
    expect(isTestRewardName('API test reward')).toBe(true);
    expect(isTestRewardName('Seasonal latte reward')).toBe(false);
  });

  test('normalizes synthetic reward names and descriptions', () => {
    expect(normalizeRewardDisplayName('API test reward')).toBe('Mercury Med Voucher');
    expect(normalizeRewardDisplayName('')).toBe('Medicine Voucher');
    expect(
      normalizeRewardDescription(
        'Cafe promo',
        'Synthetic reward generated for contract and load testing',
      ),
    ).toContain('eligible pharmacy medicine purchases');
  });

  test('uses the fallback image for synthetic rewards without an image', () => {
    expect(normalizeRewardImageUrl('api test reward', null)).toBe(PHARMACY_FALLBACK_IMAGE);
    expect(normalizeRewardImageUrl('Cafe promo', '/custom-image.png')).toBe('/custom-image.png');
  });

  test('cleans up synthetic transaction descriptions', () => {
    expect(normalizeTransactionDescription('  API   test reward   claimed  ')).toBe(
      'Mercury Med Voucher claimed',
    );
    expect(normalizeTransactionDescription('')).toBe('Reward transaction');
  });
});

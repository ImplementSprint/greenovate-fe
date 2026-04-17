import {
  ADDRESS_STORAGE_PREFIX,
  MAX_SAVED_ADDRESSES,
  normalizeSavedAddresses,
  parseSerializedAddresses,
  stringifyAddresses,
} from '../../src/lib/customer-addresses';

describe('customer address helpers', () => {
  const fallbackUser = {
    full_name: 'Juan Dela Cruz',
    phone: '09123456789',
  };

  it('exports the storage prefix and max saved addresses limit', () => {
    expect(ADDRESS_STORAGE_PREFIX).toBe('__addresses_json__:');
    expect(MAX_SAVED_ADDRESSES).toBe(4);
  });

  it('returns an empty array when there is no serialized address data', () => {
    expect(parseSerializedAddresses(undefined, fallbackUser)).toEqual([]);
  });

  it('parses stored addresses and fills legacy fields', () => {
    const serialized = `${ADDRESS_STORAGE_PREFIX}${JSON.stringify([
      {
        location: 'Metro Manila, Pasig',
        streetAddress: '123 Main St',
        postalCode: '1600',
        label: 'Work',
      },
    ])}`;

    expect(parseSerializedAddresses(serialized, fallbackUser)).toEqual([
      {
        fullName: 'Juan Dela Cruz',
        phoneNumber: '09123456789',
        province: 'Metro Manila',
        city: 'Pasig',
        postalCode: '1600',
        streetAddress: '123 Main St',
        label: 'Work',
      },
    ]);
  });

  it('prefers explicit address fields over legacy ones and defaults label to home', () => {
    const serialized = `${ADDRESS_STORAGE_PREFIX}${JSON.stringify([
      {
        fullName: 'Maria Clara',
        phoneNumber: '09999999999',
        province: 'Cebu',
        city: 'Cebu City',
        postalCode: '6000',
        streetAddress: '456 Side St',
        label: 'Home',
        location: 'Should Not Be Used',
      },
    ])}`;

    expect(parseSerializedAddresses(serialized, fallbackUser)).toEqual([
      {
        fullName: 'Maria Clara',
        phoneNumber: '09999999999',
        province: 'Cebu',
        city: 'Cebu City',
        postalCode: '6000',
        streetAddress: '456 Side St',
        label: 'Home',
      },
    ]);
  });

  it('uses region as a province fallback and falls back when parsed data is not an array', () => {
    const serialized = `${ADDRESS_STORAGE_PREFIX}${JSON.stringify([
      {
        region: 'Davao del Sur',
        city: 'Davao City',
        streetAddress: '789 Hill Rd',
      },
    ])}`;

    expect(parseSerializedAddresses(serialized, fallbackUser)).toEqual([
      {
        fullName: 'Juan Dela Cruz',
        phoneNumber: '09123456789',
        province: 'Davao del Sur',
        city: 'Davao City',
        postalCode: '',
        streetAddress: '789 Hill Rd',
        label: 'Home',
      },
    ]);

    const nonArray = `${ADDRESS_STORAGE_PREFIX}${JSON.stringify({ streetAddress: 'ignored' })}`;
    expect(parseSerializedAddresses(nonArray, fallbackUser)).toEqual([
      {
        fullName: 'Juan Dela Cruz',
        phoneNumber: '09123456789',
        province: '',
        city: '',
        postalCode: '',
        streetAddress: nonArray,
        label: 'Home',
      },
    ]);
  });

  it('falls back to a legacy single-string address when the prefix is absent', () => {
    expect(parseSerializedAddresses('Old Street Address', fallbackUser)).toEqual([
      {
        fullName: 'Juan Dela Cruz',
        phoneNumber: '09123456789',
        province: '',
        city: '',
        postalCode: '',
        streetAddress: 'Old Street Address',
        label: 'Home',
      },
    ]);
  });

  it('falls back cleanly when prefixed address data is invalid json', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(
      parseSerializedAddresses(`${ADDRESS_STORAGE_PREFIX}{invalid-json}`, fallbackUser)
    ).toEqual([
      {
        fullName: 'Juan Dela Cruz',
        phoneNumber: '09123456789',
        province: '',
        city: '',
        postalCode: '',
        streetAddress: `${ADDRESS_STORAGE_PREFIX}{invalid-json}`,
        label: 'Home',
      },
    ]);

    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it('stringifies addresses with the storage prefix', () => {
    const addresses = [
      {
        fullName: 'Juan Dela Cruz',
        phoneNumber: '09123456789',
        province: 'Metro Manila',
        city: 'Pasig',
        postalCode: '1600',
        streetAddress: '123 Main St',
        label: 'Home' as const,
      },
    ];

    expect(stringifyAddresses(addresses)).toBe(
      `${ADDRESS_STORAGE_PREFIX}${JSON.stringify(addresses)}`
    );
  });

  it('normalizes saved addresses using fallback values and phone formatting', () => {
    const normalized = normalizeSavedAddresses(
      [
        {
          fullName: '',
          phoneNumber: '09123456789',
          province: 'Metro Manila',
          city: 'Pasig',
          postalCode: '1600',
          streetAddress: '123 Main St',
          label: 'Other' as 'Home',
        },
      ],
      fallbackUser
    );

    expect(normalized).toEqual([
      {
        fullName: 'Juan Dela Cruz',
        phoneNumber: '+639123456789',
        province: 'Metro Manila',
        city: 'Pasig',
        postalCode: '1600',
        streetAddress: '123 Main St',
        label: 'Home',
      },
    ]);
  });

  it('preserves work labels and clears invalid phone numbers', () => {
    const normalized = normalizeSavedAddresses(
      [
        {
          fullName: 'Maria Clara',
          phoneNumber: 'invalid',
          province: 'Cebu',
          city: 'Cebu City',
          postalCode: '6000',
          streetAddress: '456 Side St',
          label: 'Work',
        },
      ],
      null
    );

    expect(normalized).toEqual([
      {
        fullName: 'Maria Clara',
        phoneNumber: '',
        province: 'Cebu',
        city: 'Cebu City',
        postalCode: '6000',
        streetAddress: '456 Side St',
        label: 'Work',
      },
    ]);
  });
});

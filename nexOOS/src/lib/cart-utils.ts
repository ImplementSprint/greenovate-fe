import type { CartItem } from '@/types';

export const areCartItemsEqual = (left: CartItem[], right: CartItem[]) => {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((item, index) => {
    const other = right[index];

    return (
      item.id === other?.id &&
      item.quantity === other?.quantity
    );
  });
};

export const getMaxCartQuantity = (item: Pick<CartItem, 'stock'>) => {
  if (
    typeof item.stock === 'number' &&
    Number.isFinite(item.stock) &&
    item.stock > 0
  ) {
    return Math.max(1, Math.trunc(item.stock));
  }

  return null;
};

export const clampCartItemQuantity = (item: CartItem) => {
  const maxQuantity = getMaxCartQuantity(item);

  return {
    ...item,
    quantity:
      maxQuantity === null
        ? Math.max(1, Math.trunc(item.quantity))
        : Math.min(Math.max(1, Math.trunc(item.quantity)), maxQuantity),
  };
};

export const sanitizeCartItems = (items: CartItem[]) =>
  items
    .map((item) => clampCartItemQuantity(item))
    .filter((item) => item.quantity > 0);

export const mergeCartItems = (localItems: CartItem[], remoteItems: CartItem[]) => {
  const merged = new Map<string, CartItem>();

  for (const item of remoteItems) {
    merged.set(item.id, { ...item });
  }

  for (const item of localItems) {
    const existing = merged.get(item.id);

    if (existing) {
      merged.set(item.id, {
        ...existing,
        quantity: Math.max(existing.quantity, item.quantity),
      });
      continue;
    }

    merged.set(item.id, { ...item });
  }

  return sanitizeCartItems(Array.from(merged.values()));
};

export const cartSnapshot = (items: CartItem[]) =>
  items
    .map((item) => `${item.id}:${item.quantity}`)
    .sort((left, right) => left.localeCompare(right))
    .join('|');

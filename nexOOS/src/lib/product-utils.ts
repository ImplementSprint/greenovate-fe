import type { Branch, Product } from '@/types';

export const compareLabels = (left: string, right: string) => left.localeCompare(right);

export const normalizeProducts = (products: Product[]) => {
  const seen = new Set<string>();

  return products.filter((product) => {
    const signature = [
      product.id?.trim() || 'missing-id',
      product.name?.trim() || 'missing-name',
      product.category?.trim() || 'missing-category',
      String(product.price ?? ''),
    ].join('|');

    if (seen.has(signature)) {
      return false;
    }

    seen.add(signature);
    return true;
  });
};

export const getProductRenderKey = (product: Product, idx: number) =>
  [
    product.id?.trim() || 'missing-id',
    product.name?.trim() || 'missing-name',
    product.category?.trim() || 'missing-category',
    idx,
  ].join('|');

export const getAvailableStock = (
  selectedStock: number | undefined,
  fallbackStock: number | undefined,
) => {
  if (typeof selectedStock === 'number') {
    return selectedStock;
  }

  return fallbackStock ?? 0;
};

export const getProductStock = (product: Product, inventoryStock?: number) =>
  getAvailableStock(product.stock, inventoryStock);

export const getProductScore = (
  product: Product,
  interestMap: Map<string, number>,
  categoryInterestMap: Map<string, number>,
) =>
  ((categoryInterestMap.get(product.category) ?? 0) * 100) +
  ((interestMap.get(product.id) ?? 0) * 10) +
  (product.sold ?? 0);

export const rankForYouProducts = (
  products: Product[],
  interestMap: Map<string, number>,
  categoryInterestMap: Map<string, number>,
) => [...products].sort((left, right) =>
  getProductScore(right, interestMap, categoryInterestMap) -
  getProductScore(left, interestMap, categoryInterestMap),
);

export const getAvailableCategories = (products: Product[]) => [
  'All',
  ...Array.from(
    new Set(
      products
        .map((product) => product.category)
        .filter((category): category is string => Boolean(category)),
    ),
  ).sort(compareLabels),
];

export const hasBranchStock = (selectedBranch: Branch | null, stock: number) =>
  Boolean(selectedBranch && stock > 0);

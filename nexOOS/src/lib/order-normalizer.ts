import type { Order } from '@/types';

const ORDER_ITEM_PLACEHOLDER_IMAGE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 96 96'>" +
      "<rect width='96' height='96' rx='24' fill='#e2e8f0'/>" +
      "<rect x='22' y='26' width='52' height='44' rx='14' fill='#94a3b8'/>" +
      "<circle cx='48' cy='48' r='12' fill='#f8fafc'/>" +
    "</svg>",
  );

const getOrderRowId = (row: Record<string, unknown>, index: number) =>
  typeof row.id === 'string' ? row.id : `order-${index}`;

const getOrderItemId = (entry: Record<string, unknown>, orderId: string, itemIndex: number) =>
  typeof entry.id === 'string' ? entry.id : `${orderId}-item-${itemIndex}`;

const getOrderStatus = (status: unknown): Order['status'] =>
  status === 'Processing' ||
  status === 'In Transit' ||
  status === 'Delivered' ||
  status === 'Cancelled'
    ? status
    : 'Processing';

const normalizeOrderItems = (items: unknown[], orderId: string) =>
  items.map((item, itemIndex) => {
    const entry = typeof item === 'object' && item !== null
      ? (item as Record<string, unknown>)
      : {};

    return {
      id: getOrderItemId(entry, orderId, itemIndex),
      name: typeof entry.name === 'string' ? entry.name : 'Ordered item',
      description: typeof entry.description === 'string' ? entry.description : '',
      price: Number(entry.price ?? 0),
      category: typeof entry.category === 'string' ? entry.category : 'Uncategorized',
      image:
        typeof entry.image === 'string' && entry.image.trim()
          ? entry.image
          : ORDER_ITEM_PLACEHOLDER_IMAGE,
      quantity: Math.max(1, Number(entry.quantity ?? 1)),
    };
  });

export const normalizeOrderPayload = (payload: unknown): Order[] => {
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload.map((order, index) => {
    const row = typeof order === 'object' && order !== null
      ? (order as Record<string, unknown>)
      : {};
    const items = Array.isArray(row.items) ? row.items : [];
    const orderId = getOrderRowId(row, index);

    return {
      id: orderId,
      receiptNumber: typeof row.receiptNumber === 'string' ? row.receiptNumber : undefined,
      orderNumber: typeof row.orderNumber === 'string' ? row.orderNumber : undefined,
      txNo: typeof row.txNo === 'string' ? row.txNo : undefined,
      date: typeof row.date === 'string' ? row.date : new Date().toISOString(),
      items: normalizeOrderItems(items, orderId),
      subtotal: Number(row.subtotal ?? 0),
      deliveryFee: Number(row.deliveryFee ?? 0),
      discountAmount: Number(row.discountAmount ?? 0),
      promoCode: typeof row.promoCode === 'string' ? row.promoCode : undefined,
      total: Number(row.total ?? 0),
      status: getOrderStatus(row.status),
      shippingAddress: typeof row.shippingAddress === 'string' ? row.shippingAddress : '',
      paymentMethod: typeof row.paymentMethod === 'string' ? row.paymentMethod : '',
    };
  });
};

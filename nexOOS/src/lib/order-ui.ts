export const getDisplayOrderNumber = (order: {
  receiptNumber?: string;
  orderNumber?: string;
  id: string;
}) => order.receiptNumber || order.orderNumber || order.id;

export const getOrderStatusBadgeClassName = (status: string) => {
  if (status === 'Delivered') return 'bg-green-100 text-green-700';
  if (status === 'Processing') return 'bg-blue-100 text-blue-700';
  if (status === 'Cancelled') return 'bg-red-100 text-red-700';
  return 'bg-amber-100 text-amber-700';
};

export const getOrderStatusDotClassName = (status: string) => {
  if (status === 'Delivered') return 'bg-green-500';
  if (status === 'Processing') return 'bg-blue-500';
  if (status === 'Cancelled') return 'bg-red-500';
  return 'bg-amber-500';
};

export const getReturnStatusClassName = (status: string) => {
  if (status === 'approved' || status === 'completed') {
    return 'bg-green-100 text-green-700';
  }

  if (status === 'rejected') {
    return 'bg-red-100 text-red-700';
  }

  return 'bg-amber-100 text-amber-700';
};

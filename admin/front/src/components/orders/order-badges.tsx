import { Badge } from '@/components/ui/badge';
import { strings } from '@/config/strings';
import type { OrderStatus, PaymentStatus } from '@/lib/api/commerce-types';

type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

const orderTone: Record<OrderStatus, Tone> = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  PROCESSING: 'info',
  SHIPPED: 'info',
  DELIVERED: 'success',
  CANCELLED: 'danger',
};

const paymentTone: Record<PaymentStatus, Tone> = {
  PENDING: 'warning',
  PAID: 'success',
  FAILED: 'danger',
  REFUNDED: 'neutral',
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge tone={orderTone[status]}>
      {strings.commerce.orderStatus[status]}
    </Badge>
  );
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <Badge tone={paymentTone[status]}>
      {strings.commerce.paymentStatus[status]}
    </Badge>
  );
}

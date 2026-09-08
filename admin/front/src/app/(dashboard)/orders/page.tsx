'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, ShoppingCart } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Pagination } from '@/components/ui/pagination';
import { EmptyState } from '@/components/common/empty-state';
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from '@/components/orders/order-badges';
import { strings } from '@/config/strings';
import { formatDate, formatPrice } from '@/lib/utils';
import type { OrderStatus, PaymentStatus } from '@/lib/api/commerce-types';
import { useOrders } from '@/hooks/use-orders';
import { useAuth } from '@/providers/auth-provider';

const ORDER_STATUSES: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
];
const PAYMENT_STATUSES: PaymentStatus[] = [
  'PENDING',
  'PAID',
  'FAILED',
  'REFUNDED',
];

export default function OrdersPage() {
  const o = strings.commerce.orders;
  const router = useRouter();
  const { hasPermission } = useAuth();
  const canCreate = hasPermission('order:create');

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<OrderStatus | ''>('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | ''>('');

  const { data, isLoading } = useOrders({
    page,
    limit: 10,
    search: search || undefined,
    status: status || undefined,
    paymentStatus: paymentStatus || undefined,
  });
  const items = data?.items ?? [];

  return (
    <div>
      <PageHeader
        title={o.title}
        action={
          canCreate && (
            <Button onClick={() => router.push('/orders/create')}>
              <Plus className="h-4 w-4" />
              {o.create}
            </Button>
          )
        }
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <Input
          className="max-w-xs"
          placeholder={o.searchPlaceholder}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <Select
          className="max-w-44"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as OrderStatus | '');
            setPage(1);
          }}
        >
          <option value="">{o.allStatuses}</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {strings.commerce.orderStatus[s]}
            </option>
          ))}
        </Select>
        <Select
          className="max-w-44"
          value={paymentStatus}
          onChange={(e) => {
            setPaymentStatus(e.target.value as PaymentStatus | '');
            setPage(1);
          }}
        >
          <option value="">{o.allPayments}</option>
          {PAYMENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {strings.commerce.paymentStatus[s]}
            </option>
          ))}
        </Select>
      </div>

      <Card>
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner className="h-6 w-6" />
          </div>
        ) : items.length === 0 ? (
          <EmptyState icon={ShoppingCart} message={o.empty} />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant text-right text-xs uppercase tracking-wide text-on-surface-variant">
                <th className="px-4 py-3 font-semibold">{o.orderNumber}</th>
                <th className="px-4 py-3 font-semibold">{o.customer}</th>
                <th className="px-4 py-3 font-semibold">{o.date}</th>
                <th className="px-4 py-3 font-semibold">{o.total}</th>
                <th className="px-4 py-3 font-semibold">{o.status}</th>
                <th className="px-4 py-3 font-semibold">{o.paymentStatus}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((order) => (
                <tr
                  key={order.id}
                  className="cursor-pointer border-b border-outline-variant/60 last:border-0 hover:bg-surface-container/40"
                  onClick={() => router.push(`/orders/${order.id}`)}
                >
                  <td className="px-4 py-3 font-medium text-on-surface" dir="ltr">
                    {order.orderNumber}
                  </td>
                  <td className="px-4 py-3 text-on-surface">
                    {order.customerName}
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant" dir="ltr">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-4 py-3 font-medium" dir="ltr">
                    {formatPrice(order.totalAmount)}
                  </td>
                  <td className="px-4 py-3">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3">
                    <PaymentStatusBadge status={order.paymentStatus} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {data && <Pagination meta={data.meta} onPageChange={setPage} />}
      </Card>
    </div>
  );
}

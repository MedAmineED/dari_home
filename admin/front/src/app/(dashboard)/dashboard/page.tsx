'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  Package,
  ShoppingCart,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { OrderStatusBadge } from '@/components/orders/order-badges';
import { strings } from '@/config/strings';
import { cn, formatDate, formatPrice } from '@/lib/utils';
import { useDashboardStats } from '@/hooks/use-dashboard';
import type { DashboardPeriod } from '@/lib/api/dashboard';
import type { OrderStatus } from '@/lib/api/commerce-types';

const PERIODS: DashboardPeriod[] = ['all', 'year', 'month', 'week', 'day'];
const ORDER_STATUSES: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
];

export default function DashboardPage() {
  const d = strings.dashboard;
  const [period, setPeriod] = useState<DashboardPeriod>('month');
  const { data, isLoading } = useDashboardStats(period);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-on-surface">
            {d.title}
          </h1>
          <p className="mt-1 text-sm text-on-surface-variant">{d.welcome}</p>
        </div>
        <div className="inline-flex rounded-lg border border-outline-variant bg-surface-lowest p-1">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                period === p
                  ? 'bg-primary-container text-primary-on'
                  : 'text-on-surface-variant hover:text-on-surface',
              )}
            >
              {d.periods[p]}
            </button>
          ))}
        </div>
      </div>

      {isLoading || !data ? (
        <div className="flex justify-center py-24">
          <Spinner className="h-6 w-6" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              icon={ShoppingCart}
              label={d.kpiOrders}
              value={String(data.kpis.orders)}
              hint={`${data.kpis.pendingOrders} ${d.kpiPending}`}
            />
            <KpiCard
              icon={DollarSign}
              label={d.kpiRevenue}
              value={formatPrice(data.kpis.revenue)}
              hint={d.kpiRevenueHint}
            />
            <KpiCard
              icon={Users}
              label={d.kpiNewCustomers}
              value={String(data.kpis.newCustomers)}
            />
            <KpiCard
              icon={Package}
              label={d.kpiActiveProducts}
              value={String(data.kpis.activeProducts)}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>{d.revenueTrend}</CardTitle>
              </CardHeader>
              <CardContent>
                <RevenueChart data={data.revenueTrend} empty={d.noData} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{d.ordersByStatus}</CardTitle>
              </CardHeader>
              <CardContent>
                <StatusBars counts={data.ordersByStatus} />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{d.recentOrders}</CardTitle>
              <Link
                href="/orders"
                className="text-sm text-primary hover:underline"
              >
                {d.viewAllOrders}
              </Link>
            </CardHeader>
            <CardContent>
              {data.recentOrders.length === 0 ? (
                <p className="py-8 text-center text-sm text-on-surface-variant">
                  {d.noOrders}
                </p>
              ) : (
                <table className="w-full text-sm">
                  <tbody>
                    {data.recentOrders.map((o) => (
                      <tr
                        key={o.orderNumber}
                        className="border-b border-outline-variant/60 last:border-0"
                      >
                        <td className="py-2.5 font-medium" dir="ltr">
                          {o.orderNumber}
                        </td>
                        <td className="py-2.5">{o.customerName}</td>
                        <td
                          className="py-2.5 text-on-surface-variant"
                          dir="ltr"
                        >
                          {formatDate(o.createdAt)}
                        </td>
                        <td className="py-2.5">
                          <OrderStatusBadge status={o.status} />
                        </td>
                        <td
                          className="py-2.5 text-left font-semibold"
                          dir="ltr"
                        >
                          {formatPrice(o.totalAmount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-container text-primary-on">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-on-surface-variant">{label}</p>
          <p className="font-heading text-xl font-semibold text-on-surface">
            {value}
          </p>
          {hint ? (
            <p className="text-xs text-on-surface-variant">{hint}</p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

function RevenueChart({
  data,
  empty,
}: {
  data: { label: string; value: number }[];
  empty: string;
}) {
  const max = Math.max(...data.map((p) => p.value), 0);
  if (max <= 0) {
    return (
      <p className="py-16 text-center text-sm text-on-surface-variant">
        {empty}
      </p>
    );
  }
  return (
    <div className="flex h-48 items-end gap-1" dir="ltr">
      {data.map((p, i) => (
        <div
          key={i}
          className="group flex flex-1 flex-col items-center justify-end gap-1"
          title={`${p.label}: ${formatPrice(p.value)}`}
        >
          <div
            className="w-full rounded-t bg-primary-container/70 transition-colors group-hover:bg-primary-container"
            style={{
              height: `${(p.value / max) * 100}%`,
              minHeight: p.value > 0 ? '2px' : '0',
            }}
          />
          {data.length <= 16 ? (
            <span className="text-[10px] text-on-surface-variant">
              {p.label}
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function StatusBars({ counts }: { counts: Record<OrderStatus, number> }) {
  const total = ORDER_STATUSES.reduce((sum, s) => sum + (counts[s] ?? 0), 0);
  return (
    <div className="space-y-3">
      {ORDER_STATUSES.map((s) => {
        const n = counts[s] ?? 0;
        const pct = total > 0 ? (n / total) * 100 : 0;
        return (
          <div key={s}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-on-surface-variant">
                {strings.commerce.orderStatus[s]}
              </span>
              <span className="font-medium text-on-surface">{n}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-surface-container">
              <div
                className="h-full rounded-full bg-primary-container"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

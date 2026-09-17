import { apiClient, unwrap } from './client';
import type { ApiSuccess } from './types';
import type { OrderStatus } from './commerce-types';

export type DashboardPeriod = 'all' | 'year' | 'month' | 'week' | 'day';

export interface DashboardStats {
  period: DashboardPeriod;
  kpis: {
    orders: number;
    pendingOrders: number;
    revenue: number;
    newCustomers: number;
    activeProducts: number;
  };
  ordersByStatus: Record<OrderStatus, number>;
  recentOrders: {
    orderNumber: string;
    customerName: string;
    totalAmount: number;
    status: OrderStatus;
    createdAt: string;
  }[];
  revenueTrend: { label: string; value: number }[];
}

export async function getDashboardStats(
  period: DashboardPeriod,
): Promise<DashboardStats> {
  const res = await apiClient.get<ApiSuccess<DashboardStats>>(
    '/dashboard/stats',
    { params: { period } },
  );
  return unwrap(res);
}

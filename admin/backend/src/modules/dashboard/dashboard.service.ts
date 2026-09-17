import { Injectable } from '@nestjs/common';
import { OrderStatus, Prisma, ProductStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { bucketRevenue, periodRange, type Period, type RevenuePoint } from './period';

export interface DashboardStats {
  period: Period;
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
    createdAt: Date;
  }[];
  revenueTrend: RevenuePoint[];
}

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(period: Period): Promise<DashboardStats> {
    const now = new Date();
    const { from, to } = periodRange(period, now);
    const createdAt: Prisma.DateTimeFilter = from ? { gte: from, lte: to } : { lte: to };
    const inRange: Prisma.OrderWhereInput = { createdAt };

    const [
      orders,
      pendingOrders,
      revenueAgg,
      newCustomers,
      activeProducts,
      recent,
      delivered,
    ] = await this.prisma.$transaction([
      this.prisma.order.count({ where: inRange }),
      this.prisma.order.count({ where: { ...inRange, status: OrderStatus.PENDING } }),
      this.prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { ...inRange, status: OrderStatus.DELIVERED },
      }),
      this.prisma.customer.count({ where: { createdAt } }),
      this.prisma.product.count({ where: { status: ProductStatus.ACTIVE } }),
      this.prisma.order.findMany({
        where: inRange,
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          orderNumber: true,
          customerName: true,
          totalAmount: true,
          status: true,
          createdAt: true,
        },
      }),
      this.prisma.order.findMany({
        where: { ...inRange, status: OrderStatus.DELIVERED },
        select: { createdAt: true, totalAmount: true },
      }),
    ]);

    const statusGroups = await this.prisma.order.groupBy({
      by: ['status'],
      where: inRange,
      _count: { _all: true },
    });

    const ordersByStatus = Object.fromEntries(
      Object.values(OrderStatus).map((s) => [s, 0]),
    ) as Record<OrderStatus, number>;
    for (const g of statusGroups) {
      ordersByStatus[g.status] = g._count._all;
    }

    return {
      period,
      kpis: {
        orders,
        pendingOrders,
        revenue: Number(revenueAgg._sum.totalAmount ?? 0),
        newCustomers,
        activeProducts,
      },
      ordersByStatus,
      recentOrders: recent.map((o) => ({
        orderNumber: o.orderNumber,
        customerName: o.customerName,
        totalAmount: Number(o.totalAmount),
        status: o.status,
        createdAt: o.createdAt,
      })),
      revenueTrend: bucketRevenue(
        delivered.map((o) => ({
          createdAt: o.createdAt,
          totalAmount: Number(o.totalAmount),
        })),
        period,
        now,
      ),
    };
  }
}

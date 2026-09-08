import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PaginatedResult } from '../../common/interfaces/api-response.interface';
import { buildPaginatedResult } from '../../common/utils/paginate';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { generateOrderNumber } from './order-number.util';
import {
  OrderResponse,
  toOrderListItem,
  toOrderResponse,
} from './order.mapper';
import { OrdersRepository } from './orders.repository';

const round2 = (n: number): number => Math.round(n * 100) / 100;

interface ResolvedCustomer {
  connect?: Prisma.CustomerCreateNestedOneWithoutOrdersInput['connect'];
  name: string;
  phone: string | null;
  email: string | null;
}

@Injectable()
export class OrdersService {
  constructor(
    private readonly repository: OrdersRepository,
    private readonly prisma: PrismaService,
  ) {}

  async create(dto: CreateOrderDto): Promise<OrderResponse> {
    const customer = await this.resolveCustomer(dto);
    const items = await this.buildItems(dto.items);

    const subtotal = round2(items.reduce((sum, item) => sum + item.total, 0));
    const discountAmount = dto.discountAmount ?? 0;
    const shippingAmount = dto.shippingAmount ?? 0;
    const totalAmount = round2(subtotal - discountAmount + shippingAmount);
    if (totalAmount < 0) {
      throw new BadRequestException({
        message: 'Discount cannot exceed the order total',
        code: 'INVALID_ORDER_TOTAL',
      });
    }

    const data: Omit<Prisma.OrderCreateInput, 'orderNumber'> = {
      customer: customer.connect ? { connect: customer.connect } : undefined,
      status: dto.status,
      paymentStatus: dto.paymentStatus,
      paymentMethod: dto.paymentMethod,
      subtotal: new Prisma.Decimal(subtotal),
      discountAmount: new Prisma.Decimal(discountAmount),
      shippingAmount: new Prisma.Decimal(shippingAmount),
      totalAmount: new Prisma.Decimal(totalAmount),
      customerName: customer.name,
      customerPhone: customer.phone,
      customerEmail: customer.email,
      shippingAddress: dto.shippingAddress,
      notes: dto.notes,
      items: {
        create: items.map((item) => ({
          product: { connect: { id: item.productId } },
          productNameAr: item.productNameAr,
          productNameFr: item.productNameFr,
          productSku: item.productSku,
          productPrice: new Prisma.Decimal(item.productPrice),
          quantity: item.quantity,
          total: new Prisma.Decimal(item.total),
        })),
      },
    };

    const order = await this.createWithUniqueNumber(data);
    return toOrderResponse(order);
  }

  async findAll(query: OrderQueryDto): Promise<PaginatedResult<unknown>> {
    const where: Prisma.OrderWhereInput = {};
    if (query.search) {
      where.OR = [
        { orderNumber: { contains: query.search } },
        { customerName: { contains: query.search } },
      ];
    }
    if (query.status) where.status = query.status;
    if (query.paymentStatus) where.paymentStatus = query.paymentStatus;
    if (query.customerId) where.customerId = query.customerId;

    const [items, total] = await this.repository.findMany({
      skip: query.skip,
      take: query.limit,
      where,
      orderBy: { createdAt: query.sortOrder },
    });
    return buildPaginatedResult(
      items.map(toOrderListItem),
      total,
      query.page,
      query.limit,
    );
  }

  async findOne(id: string): Promise<OrderResponse> {
    const order = await this.repository.findById(id);
    if (!order) {
      throw new NotFoundException({
        message: 'Order not found',
        code: 'ORDER_NOT_FOUND',
      });
    }
    return toOrderResponse(order);
  }

  async update(id: string, dto: UpdateOrderDto): Promise<OrderResponse> {
    await this.findOne(id);
    const order = await this.repository.update(id, {
      status: dto.status,
      paymentStatus: dto.paymentStatus,
      paymentMethod: dto.paymentMethod,
      shippingAddress: dto.shippingAddress,
      notes: dto.notes,
    });
    return toOrderResponse(order);
  }

  private async resolveCustomer(
    dto: CreateOrderDto,
  ): Promise<ResolvedCustomer> {
    if (dto.customerId) {
      const customer = await this.prisma.customer.findUnique({
        where: { id: dto.customerId },
      });
      if (!customer) {
        throw new BadRequestException({
          message: 'Selected customer does not exist',
          code: 'CUSTOMER_NOT_FOUND',
        });
      }
      return {
        connect: { id: customer.id },
        name: dto.customerName ?? `${customer.firstName} ${customer.lastName}`,
        phone: dto.customerPhone ?? customer.phone,
        email: dto.customerEmail ?? customer.email,
      };
    }

    if (!dto.customerName) {
      throw new BadRequestException({
        message: 'A customer name is required for a guest order',
        code: 'CUSTOMER_NAME_REQUIRED',
      });
    }
    return {
      name: dto.customerName,
      phone: dto.customerPhone ?? null,
      email: dto.customerEmail ?? null,
    };
  }

  private async buildItems(items: CreateOrderDto['items']): Promise<
    {
      productId: string;
      productNameAr: string;
      productNameFr: string;
      productSku: string | null;
      productPrice: number;
      quantity: number;
      total: number;
    }[]
  > {
    const ids = [...new Set(items.map((i) => i.productId))];
    const products = await this.prisma.product.findMany({
      where: { id: { in: ids } },
    });
    const byId = new Map(products.map((p) => [p.id, p]));

    return items.map((item) => {
      const product = byId.get(item.productId);
      if (!product) {
        throw new BadRequestException({
          message: `Product ${item.productId} does not exist`,
          code: 'PRODUCT_NOT_FOUND',
        });
      }
      const price = Number(product.price);
      return {
        productId: product.id,
        productNameAr: product.nameAr,
        productNameFr: product.nameFr,
        productSku: product.sku,
        productPrice: price,
        quantity: item.quantity,
        total: round2(price * item.quantity),
      };
    });
  }

  private async createWithUniqueNumber(
    data: Omit<Prisma.OrderCreateInput, 'orderNumber'>,
  ) {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      try {
        return await this.repository.create({
          ...data,
          orderNumber: generateOrderNumber(),
        });
      } catch (error) {
        const isDuplicate =
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002';
        if (!isDuplicate || attempt === 4) {
          throw error;
        }
      }
    }
    // Unreachable, but satisfies the type checker.
    throw new Error('Failed to generate a unique order number');
  }
}

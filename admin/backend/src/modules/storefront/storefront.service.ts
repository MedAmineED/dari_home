import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, PaymentStatus, Prisma, ProductStatus } from '@prisma/client';
import { PaginatedResult } from '../../common/interfaces/api-response.interface';
import { buildPaginatedResult } from '../../common/utils/paginate';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CategoriesRepository } from '../categories/categories.repository';
import { ProductsRepository } from '../products/products.repository';
import { OrdersService } from '../orders/orders.service';
import { StorefrontCheckoutDto } from './dto/storefront-checkout.dto';
import {
  StorefrontProductQueryDto,
  StorefrontSort,
} from './dto/storefront-product-query.dto';
import {
  PublicCategory,
  PublicProductCard,
  PublicProductDetail,
  toPublicCategory,
  toPublicProductCard,
  toPublicProductDetail,
} from './storefront.mapper';

/** A category id that can never match, used to force an empty result set. */
const NO_MATCH = '__no_match__';

/** Public confirmation returned after a successful checkout (no internals). */
export interface StorefrontOrderConfirmation {
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  itemCount: number;
}

@Injectable()
export class StorefrontService {
  constructor(
    private readonly products: ProductsRepository,
    private readonly categories: CategoriesRepository,
    private readonly orders: OrdersService,
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  /** Active categories, ordered, for navigation and shop filters. */
  async getCategories(): Promise<PublicCategory[]> {
    const categories = await this.categories.findAllOrdered();
    return categories.filter((c) => c.isActive).map(toPublicCategory);
  }

  /** Paginated list of ACTIVE products with public-safe fields only. */
  async getProducts(
    query: StorefrontProductQueryDto,
  ): Promise<PaginatedResult<PublicProductCard>> {
    const where: Prisma.ProductWhereInput = { status: ProductStatus.ACTIVE };

    if (query.featured === 'true') {
      where.isFeatured = true;
    }

    if (query.search) {
      where.OR = [
        { nameAr: { contains: query.search } },
        { nameFr: { contains: query.search } },
      ];
    }

    if (query.category) {
      const category = await this.categories.findBySlug(query.category);
      where.categoryId = category ? category.id : NO_MATCH;
    }

    const page = query.page;
    const limit = query.limit;
    const [items, total] = await this.products.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where,
      orderBy: this.orderBy(query.sort),
    });

    return buildPaginatedResult(
      items.map(toPublicProductCard),
      total,
      page,
      limit,
    );
  }

  /** A single ACTIVE product by its public slug. */
  async getProductBySlug(slug: string): Promise<PublicProductDetail> {
    const found = await this.products.findBySlug(slug);
    const product = found ? await this.products.findById(found.id) : null;
    if (!product || product.status !== ProductStatus.ACTIVE) {
      throw new NotFoundException({
        message: 'Product not found',
        code: 'PRODUCT_NOT_FOUND',
      });
    }
    return toPublicProductDetail(product);
  }

  /**
   * Place a public (cash-on-delivery) order. Resolves cart slugs to ACTIVE
   * products, then delegates to OrdersService so order creation logic — price
   * snapshots, totals, unique order number — is never duplicated. Prices are
   * recomputed server-side; nothing about money is trusted from the client.
   */
  async createOrder(
    dto: StorefrontCheckoutDto,
    ipAddress?: string,
  ): Promise<StorefrontOrderConfirmation> {
    const slugs = [...new Set(dto.items.map((i) => i.slug))];
    const products = await this.prisma.product.findMany({
      where: { slug: { in: slugs }, status: ProductStatus.ACTIVE },
      select: { id: true, slug: true },
    });
    const idBySlug = new Map(products.map((p) => [p.slug, p.id]));

    const items = dto.items.map((item) => {
      const productId = idBySlug.get(item.slug);
      if (!productId) {
        throw new BadRequestException({
          message: `Product "${item.slug}" is unavailable`,
          code: 'PRODUCT_UNAVAILABLE',
        });
      }
      return { productId, quantity: item.quantity };
    });

    const order = await this.orders.create({
      customerName: dto.customerName,
      customerPhone: dto.customerPhone,
      customerEmail: dto.customerEmail,
      shippingAddress: dto.shippingAddress,
      notes: dto.notes,
      paymentMethod: 'cash_on_delivery',
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      items,
    });

    await this.audit.record({
      action: 'storefront.order_created',
      entity: 'Order',
      entityId: order.id,
      ipAddress,
      metadata: { orderNumber: order.orderNumber, total: order.totalAmount },
    });

    return {
      orderNumber: order.orderNumber,
      status: order.status,
      totalAmount: order.totalAmount,
      itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
    };
  }

  private orderBy(
    sort: StorefrontSort,
  ): Prisma.ProductOrderByWithRelationInput {
    switch (sort) {
      case 'newest':
        return { createdAt: 'desc' };
      case 'price_asc':
        return { price: 'asc' };
      case 'price_desc':
        return { price: 'desc' };
      case 'popular':
      default:
        return { isFeatured: 'desc' };
    }
  }
}

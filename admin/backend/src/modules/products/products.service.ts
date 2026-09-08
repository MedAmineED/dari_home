import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PaginatedResult } from '../../common/interfaces/api-response.interface';
import { buildPaginatedResult } from '../../common/utils/paginate';
import { slugify } from '../../common/utils/slugify';
import { CategoriesRepository } from '../categories/categories.repository';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductResponse, toProductResponse } from './product.mapper';
import {
  ProductsRepository,
  ProductWithRelations,
} from './products.repository';

const SORTABLE = new Set([
  'createdAt',
  'updatedAt',
  'price',
  'nameFr',
  'nameAr',
]);

@Injectable()
export class ProductsService {
  constructor(
    private readonly repository: ProductsRepository,
    private readonly categoriesRepository: CategoriesRepository,
  ) {}

  async create(dto: CreateProductDto): Promise<ProductResponse> {
    await this.validateReferences(dto);
    const slug = await this.uniqueSlug(dto.slug ?? dto.nameFr);
    const product = await this.repository.create({
      nameAr: dto.nameAr,
      nameFr: dto.nameFr,
      slug,
      shortDescriptionAr: dto.shortDescriptionAr,
      shortDescriptionFr: dto.shortDescriptionFr,
      descriptionAr: dto.descriptionAr,
      descriptionFr: dto.descriptionFr,
      sku: dto.sku,
      price: new Prisma.Decimal(dto.price),
      oldPrice:
        dto.oldPrice !== undefined ? new Prisma.Decimal(dto.oldPrice) : null,
      status: dto.status,
      isFeatured: dto.isFeatured ?? false,
      category: dto.categoryId
        ? { connect: { id: dto.categoryId } }
        : undefined,
    });
    return toProductResponse(product);
  }

  async findAll(
    query: ProductQueryDto,
  ): Promise<PaginatedResult<ProductResponse>> {
    const where: Prisma.ProductWhereInput = {};
    if (query.search) {
      where.OR = [
        { nameAr: { contains: query.search } },
        { nameFr: { contains: query.search } },
        { sku: { contains: query.search } },
      ];
    }
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.status) where.status = query.status;
    if (query.isFeatured !== undefined) {
      where.isFeatured = query.isFeatured === 'true';
    }
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.price = {
        ...(query.minPrice !== undefined ? { gte: query.minPrice } : {}),
        ...(query.maxPrice !== undefined ? { lte: query.maxPrice } : {}),
      };
    }

    const sortBy = SORTABLE.has(query.sortBy ?? '')
      ? (query.sortBy as string)
      : 'createdAt';

    const [items, total] = await this.repository.findMany({
      skip: query.skip,
      take: query.limit,
      where,
      orderBy: { [sortBy]: query.sortOrder },
    });
    return buildPaginatedResult(
      items.map(toProductResponse),
      total,
      query.page,
      query.limit,
    );
  }

  async findOne(id: string): Promise<ProductResponse> {
    return toProductResponse(await this.ensureExists(id));
  }

  async update(id: string, dto: UpdateProductDto): Promise<ProductResponse> {
    const current = await this.ensureExists(id);
    await this.validateReferences(dto, id);

    const data: Prisma.ProductUpdateInput = {
      nameAr: dto.nameAr,
      nameFr: dto.nameFr,
      shortDescriptionAr: dto.shortDescriptionAr,
      shortDescriptionFr: dto.shortDescriptionFr,
      descriptionAr: dto.descriptionAr,
      descriptionFr: dto.descriptionFr,
      sku: dto.sku,
      status: dto.status,
      isFeatured: dto.isFeatured,
    };
    if (dto.price !== undefined) data.price = new Prisma.Decimal(dto.price);
    if (dto.oldPrice !== undefined) {
      data.oldPrice =
        dto.oldPrice === null ? null : new Prisma.Decimal(dto.oldPrice);
    }
    if (dto.slug !== undefined) {
      data.slug = await this.uniqueSlug(dto.slug || current.nameFr, id);
    }
    if (dto.categoryId !== undefined) {
      data.category = dto.categoryId
        ? { connect: { id: dto.categoryId } }
        : { disconnect: true };
    }

    return toProductResponse(await this.repository.update(id, data));
  }

  async remove(id: string): Promise<{ id: string }> {
    await this.ensureExists(id);
    await this.repository.delete(id);
    return { id };
  }

  async ensureExists(id: string): Promise<ProductWithRelations> {
    const product = await this.repository.findById(id);
    if (!product) {
      throw new NotFoundException({
        message: 'Product not found',
        code: 'PRODUCT_NOT_FOUND',
      });
    }
    return product;
  }

  private async validateReferences(
    dto: CreateProductDto | UpdateProductDto,
    excludeId?: string,
  ): Promise<void> {
    if (dto.categoryId) {
      const category = await this.categoriesRepository.findById(dto.categoryId);
      if (!category) {
        throw new BadRequestException({
          message: 'Selected category does not exist',
          code: 'CATEGORY_NOT_FOUND',
        });
      }
    }
    if (dto.sku) {
      const existing = await this.repository.findBySku(dto.sku);
      if (existing && existing.id !== excludeId) {
        throw new BadRequestException({
          message: 'A product with this SKU already exists',
          code: 'SKU_TAKEN',
        });
      }
    }
  }

  private async uniqueSlug(
    source: string,
    excludeId?: string,
  ): Promise<string> {
    const base = slugify(source) || 'product';
    let candidate = base;
    let suffix = 2;
    for (;;) {
      const existing = await this.repository.findBySlug(candidate);
      if (!existing || existing.id === excludeId) {
        return candidate;
      }
      candidate = `${base}-${suffix}`;
      suffix += 1;
    }
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { AuditService } from '../audit/audit.service';
import { CategoriesService } from './categories.service';
import { CategoryQueryDto } from './dto/category-query.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags('Categories')
@ApiBearerAuth()
@UseGuards(PermissionsGuard)
@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly auditService: AuditService,
  ) {}

  @Get()
  @RequirePermissions('category:read')
  findAll(@Query() query: CategoryQueryDto) {
    return this.categoriesService.findAll(query);
  }

  @Get('tree')
  @RequirePermissions('category:read')
  findTree() {
    return this.categoriesService.findTree();
  }

  @Get(':id')
  @RequirePermissions('category:read')
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Post()
  @RequirePermissions('category:create')
  async create(
    @Body() dto: CreateCategoryDto,
    @CurrentUser('id') actorId: string,
  ) {
    const category = await this.categoriesService.create(dto);
    await this.auditService.record({
      userId: actorId,
      action: 'category.created',
      entity: 'Category',
      entityId: category.id,
    });
    return category;
  }

  @Patch(':id')
  @RequirePermissions('category:update')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
    @CurrentUser('id') actorId: string,
  ) {
    const category = await this.categoriesService.update(id, dto);
    await this.auditService.record({
      userId: actorId,
      action: 'category.updated',
      entity: 'Category',
      entityId: id,
    });
    return category;
  }

  @Delete(':id')
  @RequirePermissions('category:delete')
  async remove(@Param('id') id: string, @CurrentUser('id') actorId: string) {
    const result = await this.categoriesService.remove(id);
    await this.auditService.record({
      userId: actorId,
      action: 'category.deleted',
      entity: 'Category',
      entityId: id,
    });
    return result;
  }
}

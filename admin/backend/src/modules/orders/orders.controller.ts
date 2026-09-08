import {
  Body,
  Controller,
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
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrdersService } from './orders.service';

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(PermissionsGuard)
@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly auditService: AuditService,
  ) {}

  @Get()
  @RequirePermissions('order:read')
  findAll(@Query() query: OrderQueryDto) {
    return this.ordersService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('order:read')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Post()
  @RequirePermissions('order:create')
  async create(
    @Body() dto: CreateOrderDto,
    @CurrentUser('id') actorId: string,
  ) {
    const order = await this.ordersService.create(dto);
    await this.auditService.record({
      userId: actorId,
      action: 'order.created',
      entity: 'Order',
      entityId: order.id,
      metadata: { orderNumber: order.orderNumber, total: order.totalAmount },
    });
    return order;
  }

  @Patch(':id')
  @RequirePermissions('order:update')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateOrderDto,
    @CurrentUser('id') actorId: string,
  ) {
    const order = await this.ordersService.update(id, dto);
    await this.auditService.record({
      userId: actorId,
      action: 'order.updated',
      entity: 'Order',
      entityId: id,
      metadata: {
        status: dto.status,
        paymentStatus: dto.paymentStatus,
      },
    });
    return order;
  }
}

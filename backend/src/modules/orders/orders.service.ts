import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Order, OrderStatus } from 'generated/prisma/client';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { QueryOrderDto } from './dto/query-order.dto';

export interface PaginatedOrders {
  data: Order[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const ORDER_INCLUDE = {
  items: {
    include: {
      menuItem: {
        select: { id: true, name: true, image: true },
      },
    },
  },
  user: {
    select: { id: true, name: true, email: true },
  },
} as const;

// Valid status transitions: PENDING→PREPARING→READY→COMPLETED
const VALID_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.PREPARING],
  [OrderStatus.PREPARING]: [OrderStatus.READY],
  [OrderStatus.READY]: [OrderStatus.COMPLETED],
  [OrderStatus.COMPLETED]: [],
};

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, createOrderDto: CreateOrderDto): Promise<Order> {
    const { address, items } = createOrderDto;

    // Fetch all menu items in a single query
    const menuItemIds = items.map((item) => item.menuItemId);
    const menuItems = await this.prisma.menuItem.findMany({
      where: { id: { in: menuItemIds } },
    });

    // Validate all items exist
    if (menuItems.length !== menuItemIds.length) {
      const foundIds = new Set(menuItems.map((mi) => mi.id));
      const missingIds = menuItemIds.filter((id) => !foundIds.has(id));
      throw new BadRequestException(
        `Menu items not found: ${missingIds.join(', ')}`,
      );
    }

    // Validate all items are available
    const unavailableItems = menuItems.filter((mi) => !mi.available);
    if (unavailableItems.length > 0) {
      throw new BadRequestException(
        `The following items are currently unavailable: ${unavailableItems.map((i) => i.name).join(', ')}`,
      );
    }

    // Build price lookup map
    const priceMap = new Map(menuItems.map((mi) => [mi.id, mi]));

    // Calculate total from SERVER-SIDE prices (prevents price manipulation)
    let totalAmount = 0;
    const orderItemsData = items.map((item) => {
      const menuItem = priceMap.get(item.menuItemId);
      if (!menuItem) {
        throw new BadRequestException(
          `Menu item "${item.menuItemId}" not found`,
        );
      }
      const lineTotal = menuItem.price * item.quantity;
      totalAmount += lineTotal;

      return {
        menuItemId: menuItem.id,
        menuItemName: menuItem.name,
        quantity: item.quantity,
        price: menuItem.price,
      };
    });

    // Round to 2 decimal places
    totalAmount = Math.round(totalAmount * 100) / 100;

    // Create order and order items in a transaction
    const order = await this.prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          userId,
          address,
          totalAmount,
          status: OrderStatus.PENDING,
          items: {
            create: orderItemsData,
          },
        },
        include: ORDER_INCLUDE,
      });

      return createdOrder;
    });

    return order;
  }

  async findUserOrders(userId: string): Promise<Order[]> {
    return this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: ORDER_INCLUDE,
    });
  }

  async findAll(query: QueryOrderDto): Promise<PaginatedOrders> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: ORDER_INCLUDE,
      }),
      this.prisma.order.count(),
    ]);

    return {
      data: orders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, userId?: string): Promise<Order> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: ORDER_INCLUDE,
    });

    if (!order) {
      throw new NotFoundException(`Order with ID "${id}" not found`);
    }

    // If userId is provided, verify the order belongs to the user
    if (userId && order.userId !== userId) {
      throw new ForbiddenException('You do not have access to this order');
    }

    return order;
  }

  async updateStatus(
    id: string,
    updateStatusDto: UpdateOrderStatusDto,
  ): Promise<Order> {
    const order = await this.prisma.order.findUnique({ where: { id } });

    if (!order) {
      throw new NotFoundException(`Order with ID "${id}" not found`);
    }

    // Validate status transition
    const allowedTransitions = VALID_STATUS_TRANSITIONS[order.status];
    if (!allowedTransitions.includes(updateStatusDto.status)) {
      throw new BadRequestException(
        `Cannot transition from "${order.status}" to "${updateStatusDto.status}". ` +
          `Allowed transitions: ${allowedTransitions.length > 0 ? allowedTransitions.join(', ') : 'none (order is completed)'}`,
      );
    }

    return this.prisma.order.update({
      where: { id },
      data: { status: updateStatusDto.status },
      include: ORDER_INCLUDE,
    });
  }
}

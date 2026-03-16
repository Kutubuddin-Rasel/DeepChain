export type Role = 'USER' | 'ADMIN';
export type OrderStatus = 'PENDING' | 'PREPARING' | 'READY' | 'COMPLETED';

export interface User {
  id: string;
  name: string;
  email: string;
  address: string;
  role: Role;
  createdAt?: string;
}

export type AuthUser = Pick<User, "id" | "name" | "email" | "address" | "role">;

export interface Category {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    items: number;
  };
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  available: boolean;
  categoryId: string;
  category?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface MenuItemSummary {
  id: string;
  name: string;
  image: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  menuItemName: string;
  quantity: number;
  price: number;
  createdAt: string;
  menuItem?: MenuItemSummary;
}

export interface Order {
  id: string;
  userId: string;
  address: string;
  totalAmount: number;
  status: OrderStatus;
  items: OrderItem[];
  user?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

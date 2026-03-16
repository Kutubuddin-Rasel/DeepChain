import { PrismaClient, Role, OrderStatus } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as argon2 from 'argon2';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Sample food image URLs (free stock images)
const FOOD_IMAGES: Record<string, string[]> = {
  starters: [
    'https://images.unsplash.com/photo-1541014741259-de529411b96a?w=800&q=80',
    'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=800&q=80',
    'https://images.unsplash.com/photo-1603073163308-9654c3fb70b5?w=800&q=80',
  ],
  mainCourses: [
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
    'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80',
  ],
  desserts: [
    'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&q=80',
    'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&q=80',
  ],
};

async function main(): Promise<void> {
  console.log('Starting Foodio seed...\n');

  // ──────────────────────────────────────────────
  // 1. Clear existing data (order matters for FKs)
  // ──────────────────────────────────────────────
  console.log('Clearing existing data...');
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  console.log('All tables cleared\n');

  // ──────────────────────────────────────────────
  // 2. Seed Users
  // ──────────────────────────────────────────────
  console.log('👤 Creating users...');
  const adminPassword = await argon2.hash('admin123', {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });
  const userPassword = await argon2.hash('user123', {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });

  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@foodio.com',
      password: adminPassword,
      address: 'House: 1, Road: 1, Foodio HQ, Dhaka',
      role: Role.ADMIN,
    },
  });
  console.log(`Admin: ${admin.email} (password: admin123)`);

  const testUser = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'user@foodio.com',
      password: userPassword,
      address: 'House: 23, Road: 23, Jamaica, USA',
      role: Role.USER,
    },
  });
  console.log(`User:  ${testUser.email} (password: user123)\n`);

  // ──────────────────────────────────────────────
  // 3. Seed Categories
  // ──────────────────────────────────────────────
  console.log('Creating categories...');
  const starters = await prisma.category.create({
    data: { name: 'Starters' },
  });
  const mainCourses = await prisma.category.create({
    data: { name: 'Main Courses' },
  });
  const desserts = await prisma.category.create({
    data: { name: 'Desserts' },
  });
  console.log(`  ${starters.name}, ${mainCourses.name}, ${desserts.name}\n`);

  // ──────────────────────────────────────────────
  // 4. Seed Menu Items
  // ──────────────────────────────────────────────
  console.log('Creating menu items...');

  const menuItemsData = [
    {
      name: 'Bruschetta',
      description:
        'Toasted bread topped with fresh tomatoes, basil, and a drizzle of olive oil.',
      price: 8.99,
      image: FOOD_IMAGES.starters[0],
      categoryId: starters.id,
      available: true,
    },
    {
      name: 'Caesar Salad',
      description:
        'Crisp romaine lettuce with parmesan, croutons, and our signature Caesar dressing.',
      price: 12.5,
      image: FOOD_IMAGES.starters[1],
      categoryId: starters.id,
      available: true,
    },
    {
      name: 'Pan-Seared Scallops',
      description:
        'Perfectly seared sea scallops served on a bed of cauliflower purée with micro herbs.',
      price: 24.0,
      image: FOOD_IMAGES.starters[2],
      categoryId: starters.id,
      available: true,
    },
    {
      name: 'Grilled Salmon',
      description:
        'Atlantic salmon fillet grilled to perfection, served with roasted vegetables and lemon butter sauce.',
      price: 28.99,
      image: FOOD_IMAGES.mainCourses[0],
      categoryId: mainCourses.id,
      available: true,
    },
    {
      name: 'Wagyu Beef Burger',
      description:
        'Premium wagyu beef patty with aged cheddar, caramelized onions, and truffle aioli.',
      price: 32.0,
      image: FOOD_IMAGES.mainCourses[1],
      categoryId: mainCourses.id,
      available: true,
    },
    {
      name: 'Margherita Pizza',
      description:
        'Wood-fired pizza with San Marzano tomato sauce, fresh mozzarella, and basil.',
      price: 18.5,
      image: FOOD_IMAGES.mainCourses[2],
      categoryId: mainCourses.id,
      available: false,
    },
    {
      name: 'Chocolate Lava Cake',
      description:
        'Warm dark chocolate cake with a molten center, served with vanilla ice cream.',
      price: 14.99,
      image: FOOD_IMAGES.desserts[0],
      categoryId: desserts.id,
      available: true,
    },
    {
      name: 'Crème Brûlée',
      description:
        'Classic French custard dessert with a caramelized sugar crust and fresh berries.',
      price: 11.0,
      image: FOOD_IMAGES.desserts[1],
      categoryId: desserts.id,
      available: true,
    },
  ];

  const createdMenuItems = await Promise.all(
    menuItemsData.map((item) => prisma.menuItem.create({ data: item })),
  );
  console.log(`   ✅ Created ${createdMenuItems.length} menu items\n`);

  // ──────────────────────────────────────────────
  // 5. Seed Sample Orders
  // ──────────────────────────────────────────────
  console.log('Creating sample orders...');

  // Order 1: Completed order
  const order1 = await prisma.order.create({
    data: {
      userId: testUser.id,
      address: testUser.address,
      totalAmount: 46.49,
      status: OrderStatus.COMPLETED,
      items: {
        create: [
          {
            menuItemId: createdMenuItems[0].id,
            menuItemName: createdMenuItems[0].name,
            quantity: 1,
            price: createdMenuItems[0].price,
          },
          {
            menuItemId: createdMenuItems[3].id,
            menuItemName: createdMenuItems[3].name,
            quantity: 1,
            price: createdMenuItems[3].price,
          },
          {
            menuItemId: createdMenuItems[0].id,
            menuItemName: createdMenuItems[0].name,
            quantity: 1,
            price: createdMenuItems[0].price,
          },
        ],
      },
    },
  });
  console.log(`Order #1 (${order1.status}): $${order1.totalAmount}`);

  // Order 2: Pending order
  const order2 = await prisma.order.create({
    data: {
      userId: testUser.id,
      address: testUser.address,
      totalAmount: 24.0,
      status: OrderStatus.PENDING,
      items: {
        create: [
          {
            menuItemId: createdMenuItems[2].id,
            menuItemName: createdMenuItems[2].name,
            quantity: 1,
            price: createdMenuItems[2].price,
          },
        ],
      },
    },
  });
  console.log(`Order #2 (${order2.status}): $${order2.totalAmount}\n`);

  // ──────────────────────────────────────────────
  // Summary
  // ──────────────────────────────────────────────
  console.log('═══════════════════════════════════════');
  console.log('🎉 Seed completed successfully!');
  console.log('═══════════════════════════════════════');
  console.log(`   Users:      2 (admin + test user)`);
  console.log(`   Categories: 3`);
  console.log(`   Menu Items: ${createdMenuItems.length}`);
  console.log(`   Orders:     2`);
  console.log('');
  console.log('   🔑 Admin Login:');
  console.log('      Email:    admin@foodio.com');
  console.log('      Password: admin123');
  console.log('');
  console.log('   🔑 User Login:');
  console.log('      Email:    user@foodio.com');
  console.log('      Password: user123');
  console.log('═══════════════════════════════════════\n');
}

main()
  .catch((error: Error) => {
    console.error('Seed failed:', error.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

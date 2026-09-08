import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/** Canonical permission catalog: resource -> allowed actions. */
const RESOURCE_ACTIONS: Record<string, string[]> = {
  user: ['create', 'read', 'update', 'delete'],
  role: ['create', 'read', 'update', 'delete'],
  product: ['create', 'read', 'update', 'delete'],
  category: ['create', 'read', 'update', 'delete'],
  order: ['create', 'read', 'update', 'delete'],
  customer: ['create', 'read', 'update', 'delete'],
  setting: ['read', 'update'],
  dashboard: ['read'],
  audit: ['read'],
};

/** Permission names granted to each non-super role. */
const ROLE_PERMISSIONS: Record<string, string[]> = {
  ADMIN: [
    'product:create',
    'product:read',
    'product:update',
    'product:delete',
    'category:create',
    'category:read',
    'category:update',
    'category:delete',
    'order:create',
    'order:read',
    'order:update',
    'order:delete',
    'customer:create',
    'customer:read',
    'customer:update',
    'customer:delete',
    'setting:read',
    'dashboard:read',
    'audit:read',
  ],
  MANAGER: [
    'product:read',
    'category:read',
    'order:read',
    'order:update',
    'customer:read',
    'dashboard:read',
  ],
};

async function seedPermissions(): Promise<Map<string, string>> {
  const idByName = new Map<string, string>();
  for (const [resource, actions] of Object.entries(RESOURCE_ACTIONS)) {
    for (const action of actions) {
      const name = `${resource}:${action}`;
      const permission = await prisma.permission.upsert({
        where: { name },
        update: { resource, action },
        create: {
          name,
          resource,
          action,
          description: `Can ${action} ${resource}`,
        },
      });
      idByName.set(name, permission.id);
    }
  }
  console.log(`  ✓ ${idByName.size} permissions`);
  return idByName;
}

async function seedRoles(
  permissionIds: Map<string, string>,
): Promise<Map<string, string>> {
  const roleIdByName = new Map<string, string>();

  const definitions: { name: string; description: string }[] = [
    { name: 'SUPER_ADMIN', description: 'Full, unrestricted system access' },
    { name: 'ADMIN', description: 'Manage catalog, orders and customers' },
    { name: 'MANAGER', description: 'Limited operational access' },
  ];

  for (const def of definitions) {
    const role = await prisma.role.upsert({
      where: { name: def.name },
      update: { description: def.description, isSystem: true },
      create: { name: def.name, description: def.description, isSystem: true },
    });
    roleIdByName.set(def.name, role.id);

    const permissionNames =
      def.name === 'SUPER_ADMIN'
        ? [...permissionIds.keys()]
        : (ROLE_PERMISSIONS[def.name] ?? []);

    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
    await prisma.rolePermission.createMany({
      data: permissionNames
        .map((name) => permissionIds.get(name))
        .filter((id): id is string => Boolean(id))
        .map((permissionId) => ({ roleId: role.id, permissionId })),
      skipDuplicates: true,
    });
  }
  console.log(`  ✓ ${roleIdByName.size} roles`);
  return roleIdByName;
}

async function seedSuperAdmin(superAdminRoleId: string): Promise<void> {
  const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@darihome.tn';
  const password = process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMe123!';
  const firstName = process.env.SEED_ADMIN_FIRST_NAME ?? 'Super';
  const lastName = process.env.SEED_ADMIN_LAST_NAME ?? 'Admin';

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: { firstName, lastName, isActive: true },
    create: { email, firstName, lastName, password: passwordHash, isActive: true },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: user.id, roleId: superAdminRoleId } },
    update: {},
    create: { userId: user.id, roleId: superAdminRoleId },
  });

  console.log(`  ✓ SUPER_ADMIN user: ${email}`);
}

async function seedCategories(): Promise<void> {
  const categories = [
    { nameAr: 'أثاث', nameFr: 'Mobilier', slug: 'mobilier', sortOrder: 1 },
    { nameAr: 'ديكور', nameFr: 'Décoration', slug: 'decoration', sortOrder: 2 },
    { nameAr: 'إضاءة', nameFr: 'Luminaires', slug: 'luminaires', sortOrder: 3 },
    { nameAr: 'مطبخ', nameFr: 'Cuisine', slug: 'cuisine', sortOrder: 4 },
  ];
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: { nameAr: category.nameAr, nameFr: category.nameFr },
      create: category,
    });
  }
  console.log(`  ✓ ${categories.length} example categories`);
}

async function main(): Promise<void> {
  console.log('Seeding Darihome admin database...');
  const permissionIds = await seedPermissions();
  const roleIds = await seedRoles(permissionIds);
  const superAdminRoleId = roleIds.get('SUPER_ADMIN');
  if (!superAdminRoleId) {
    throw new Error('SUPER_ADMIN role was not created');
  }
  await seedSuperAdmin(superAdminRoleId);
  await seedCategories();
  console.log('Seed complete.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });

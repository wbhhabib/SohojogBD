import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const SALT_ROUNDS = 12;

async function main() {
  console.log('🌱 Seeding started...\n');


  console.log('Seeding users...');
  const hashedPassword = await bcrypt.hash('Password123!', SALT_ROUNDS);

  const mohsin = await prisma.user.upsert({
    where: { email: 'mohsin@example.com' },
    update: {},
    create: {
      name: 'Mohsin Habib',
      email: 'mohsin@example.com',
      password: hashedPassword,
      role: Role.ADMIN,
      isVerified: true,
    },
  });

  const ahsan = await prisma.user.upsert({
    where: { email: 'ahsan@example.com' },
    update: {},
    create: {
      name: 'Ahsan Habib',
      email: 'ahsan@example.com',
      password: hashedPassword,
      role: Role.USER,
      isVerified: true,
    },
  });

  const sabbir = await prisma.user.upsert({
    where: { email: 'sabbir@example.com' },
    update: {},
    create: {
      name: 'Sabbir Hossain',
      email: 'sabbir@example.com',
      password: hashedPassword,
      role: Role.USER,
      isVerified: true,
    },
  });

  const junaid = await prisma.user.upsert({
    where: { email: 'junaid@example.com' },
    update: {},
    create: {
      name: 'Junaid Islam',
      email: 'junaid@example.com',
      password: hashedPassword,
      role: Role.USER,
      isVerified: true,
    },
  });

  const muntakim = await prisma.user.upsert({
    where: { email: 'muntakim@example.com' },
    update: {},
    create: {
      name: 'Muntakim Billah',
      email: 'muntakim@example.com',
      password: hashedPassword,
      role: Role.USER,
      isVerified: false,
    },
  });

  console.log('✓ Users seeded (5)\n');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 Seeding complete ✓');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`   Users: 5`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
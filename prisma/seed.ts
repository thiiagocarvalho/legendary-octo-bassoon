import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!password) {
    throw new Error('SEED_ADMIN_PASSWORD é obrigatório para criar o administrador inicial.');
  }

  await prisma.user.upsert({
    where: { email: 'admin@pilates.local' },
    update: {
      passwordHash: await bcrypt.hash(password, 12),
      role: Role.ADMIN,
    },
    create: {
      email: 'admin@pilates.local',
      passwordHash: await bcrypt.hash(password, 12),
      role: Role.ADMIN,
    },
  });
}

main()
  .finally(async () => prisma.$disconnect());

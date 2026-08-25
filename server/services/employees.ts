import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../../lib/db';
import { writeAuditLog } from './audit';

const employeeInput = z.object({
  fullName: z.string().trim().min(2).max(100),
  email: z.string().trim().email(),
  password: z.string().min(8).max(100),
});

export async function createEmployee(input: unknown, actorId: string) {
  const data = employeeInput.parse(input);
  const employee = await prisma.user.create({
    data: { fullName: data.fullName, email: data.email.toLowerCase(), passwordHash: await bcrypt.hash(data.password, 12), role: 'EMPLOYEE' },
  });
  await writeAuditLog({ actorId, action: 'EMPLOYEE_CREATED', entity: 'User', entityId: employee.id, reason: employee.fullName ?? employee.email });
  return employee;
}

import { prisma } from '../../lib/db';

export function writeAuditLog(input: { actorId: string; action: string; entity: string; entityId: string; reason?: string }) {
  return prisma.auditLog.create({ data: input });
}

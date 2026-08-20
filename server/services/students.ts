import { prisma } from '../../lib/db';
import { functionalProgressInput, healthProfileInput, studentInput } from '../../lib/validation/students';
import { writeAuditLog } from './audit';

export async function createStudent(input: unknown, actorId: string) {
  const data = studentInput.parse(input);
  const student = await prisma.student.create({ data });
  await writeAuditLog({ actorId, action: 'STUDENT_CREATED', entity: 'Student', entityId: student.id });
  return student;
}

export async function upsertHealthProfile(studentId: string, input: unknown, actorId: string) {
  const data = healthProfileInput.parse(input);
  const health = await prisma.healthProfile.upsert({
    where: { studentId },
    create: { studentId, ...data },
    update: data,
  });
  await writeAuditLog({ actorId, action: 'HEALTH_PROFILE_UPDATED', entity: 'HealthProfile', entityId: health.id });
  return health;
}

export async function createFunctionalProgress(studentId: string, input: unknown, actorId: string) {
  const data = functionalProgressInput.parse(input);
  const progress = await prisma.functionalProgress.create({ data: { studentId, createdBy: actorId, ...data } });
  await writeAuditLog({ actorId, action: 'FUNCTIONAL_PROGRESS_CREATED', entity: 'FunctionalProgress', entityId: progress.id });
  return progress;
}

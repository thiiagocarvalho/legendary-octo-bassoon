import { prisma } from '../../lib/db';
import bcrypt from 'bcryptjs';
import { functionalProgressInput, healthProfileInput, studentInput, studentUpdateInput } from '../../lib/validation/students';
import { writeAuditLog } from './audit';
import { healthHistoryData } from './health-history';

export async function createStudent(input: unknown, actorId: string) {
  const data = studentInput.parse(input);
  const { email, password, ...studentData } = data;
  const student = await prisma.$transaction(async (tx) => {
    const user = email && password ? await tx.user.create({
      data: { email: email.toLowerCase(), passwordHash: await bcrypt.hash(password, 12), role: 'STUDENT' },
    }) : null;
    return tx.student.create({ data: { ...studentData, userId: user?.id } });
  });
  await writeAuditLog({ actorId, action: 'STUDENT_CREATED', entity: 'Student', entityId: student.id });
  return student;
}

export async function updateStudent(studentId: string, input: unknown, actorId: string) {
  const data = studentUpdateInput.parse(input);
  const student = await prisma.student.update({ where: { id: studentId }, data });
  await writeAuditLog({ actorId, action: 'STUDENT_UPDATED', entity: 'Student', entityId: student.id });
  return student;
}

export async function upsertHealthProfile(studentId: string, input: unknown, actorId: string) {
  const data = healthProfileInput.parse(input);
  const health = await prisma.$transaction(async (tx) => {
    const profile = await tx.healthProfile.upsert({
      where: { studentId },
      create: { studentId, ...data },
      update: data,
    });
    await tx.healthProfileHistory.create({ data: { studentId, ...healthHistoryData(data, actorId) } });
    return profile;
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

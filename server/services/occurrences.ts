import { prisma } from '../../lib/db';

export async function materializeOccurrences(classSlotId: string, from = new Date(), weeks = 8) {
  const slot = await prisma.classSlot.findUniqueOrThrow({ where: { id: classSlotId } });
  const start = new Date(from); start.setHours(0, 0, 0, 0);
  const rows = [slot.weekday, slot.secondWeekday].filter((weekday): weekday is number => weekday !== null).flatMap((weekday) => {
    const offset = (weekday - start.getDay() + 7) % 7;
    return Array.from({ length: weeks }, (_, index) => {
      const startsAt = new Date(start); startsAt.setDate(start.getDate() + offset + index * 7);
      const [hours, minutes] = slot.startsTime.split(':').map(Number); startsAt.setHours(hours, minutes, 0, 0);
      const endsAt = new Date(startsAt.getTime() + slot.duration * 60_000);
      return { classSlotId, startsAt, endsAt };
    });
  });
  await prisma.classOccurrence.createMany({ data: rows, skipDuplicates: true });
  return prisma.classOccurrence.findMany({ where: { classSlotId, startsAt: { gte: from } }, orderBy: { startsAt: 'asc' } });
}

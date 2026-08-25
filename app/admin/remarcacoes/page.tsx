import { RescheduleNotifications } from '../../../components/admin/reschedule-notifications';
import { prisma } from '../../../lib/db';

export default async function ReschedulesPage() {
  const notifications = await prisma.studentMessage.findMany({ where: { content: { startsWith: 'Remarcação de aula' } }, include: { student: { select: { fullName: true } } }, orderBy: { createdAt: 'desc' } });
  return <section><h1 className="text-3xl font-bold">Remarcações de aulas</h1><p className="mt-2 text-slate-600">Acompanhe as alterações de data e horário feitas pelos alunos.</p><RescheduleNotifications notifications={notifications}/></section>;
}

import { BookingCalendar } from '../../../components/student/booking-calendar';
import { requireStudent } from '../../../lib/auth';
import { prisma } from '../../../lib/db';
export default async function StudentSchedulePage() { const user=await requireStudent(); const student=user.studentId?await prisma.student.findUnique({where:{id:user.studentId},select:{fullName:true}}):null; return <main className="mx-auto max-w-md p-5"><p className="text-base text-slate-600">Olá, {student?.fullName ?? 'aluno'}!</p><h1 className="mt-1 text-3xl font-bold">Minha agenda</h1><p className="my-4 text-lg text-slate-600">Veja suas aulas ou troque um horário.</p><BookingCalendar /></main>; }

import { BookingStatus } from '@prisma/client';
import { prisma } from '../../lib/db';
import { writeAuditLog } from './audit';
const statuses = [BookingStatus.PRESENT, BookingStatus.ABSENT, BookingStatus.CANCELED] as const;
export function isAttendanceStatus(value: string): value is typeof statuses[number] { return statuses.includes(value as typeof statuses[number]); }
export async function recordAttendance(bookingId:string,status:typeof statuses[number],actorId:string,reason?:string){const booking=await prisma.booking.update({where:{id:bookingId},data:{status}});await writeAuditLog({actorId,action:`BOOKING_${status}`,entity:'Student',entityId:booking.studentId,reason});return booking;}

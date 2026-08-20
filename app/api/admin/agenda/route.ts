import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../lib/auth';
import { prisma } from '../../../../lib/db';
export async function GET(){await requireAdmin();return NextResponse.json(await prisma.classOccurrence.findMany({where:{startsAt:{gte:new Date()}},include:{classSlot:true,bookings:{include:{student:true},orderBy:{createdAt:'asc'}}},orderBy:{startsAt:'asc'},take:30}));}

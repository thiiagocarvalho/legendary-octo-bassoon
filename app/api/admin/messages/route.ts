import { NextResponse } from 'next/server'; import { requireAdmin } from '../../../../lib/auth'; import { prisma } from '../../../../lib/db';
export async function GET(){await requireAdmin();return NextResponse.json(await prisma.studentMessage.findMany({include:{student:{select:{fullName:true}}},orderBy:{createdAt:'desc'}}));}

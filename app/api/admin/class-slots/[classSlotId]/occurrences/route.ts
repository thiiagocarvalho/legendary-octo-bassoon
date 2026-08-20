import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../../../lib/auth';
import { materializeOccurrences } from '../../../../../../server/services/occurrences';
export async function POST(_: Request, { params }: { params: Promise<{ classSlotId: string }> }) { await requireAdmin(); const { classSlotId } = await params; return NextResponse.json(await materializeOccurrences(classSlotId)); }

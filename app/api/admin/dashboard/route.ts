import { NextResponse } from 'next/server';
import { requireOperationalAccess } from '../../../../lib/auth';
import { getDashboard } from '../../../../server/services/dashboard';
export async function GET(){const user=await requireOperationalAccess();return NextResponse.json(await getDashboard(new Date(), { includeFinancial: user.role === 'ADMIN' }));}

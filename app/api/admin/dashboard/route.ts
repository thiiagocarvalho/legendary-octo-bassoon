import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../lib/auth';
import { getDashboard } from '../../../../server/services/dashboard';
export async function GET(){await requireAdmin();return NextResponse.json(await getDashboard());}

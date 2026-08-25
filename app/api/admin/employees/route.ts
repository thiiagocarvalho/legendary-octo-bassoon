import { NextResponse } from 'next/server';
import { requireFinancialAccess } from '../../../../lib/auth';
import { UnauthorizedError } from '../../../../lib/permissions';
import { createEmployee } from '../../../../server/services/employees';

export async function POST(request: Request) {
  try {
    const admin = await requireFinancialAccess();
    return NextResponse.json(await createEmployee(await request.json(), admin.id), { status: 201 });
  } catch (error) {
    if (error instanceof UnauthorizedError) return NextResponse.json({ error: 'Acesso restrito ao administrador.' }, { status: 403 });
    if (error instanceof Error && error.message.includes('Unique constraint')) return NextResponse.json({ error: 'Este e-mail já está em uso.' }, { status: 409 });
    return NextResponse.json({ error: 'Não foi possível criar a conta da funcionária.' }, { status: 400 });
  }
}

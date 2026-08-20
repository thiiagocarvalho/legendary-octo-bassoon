import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../lib/auth';
import { UnauthorizedError } from '../../../../lib/permissions';
import { studentCreationErrorMessage } from '../../../../lib/student-creation-errors';
import { createStudent } from '../../../../server/services/students';

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    const student = await createStudent(await request.json(), admin.id);
    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    if (error instanceof UnauthorizedError) return NextResponse.json({ error: error.message }, { status: 403 });
    return NextResponse.json({ error: studentCreationErrorMessage(error) }, { status: 400 });
  }
}

import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../../lib/auth';
import { UnauthorizedError } from '../../../../../lib/permissions';
import { updateStudent } from '../../../../../server/services/students';
export async function PATCH(request: Request,{params}:{params:Promise<{studentId:string}>}){try{const admin=await requireAdmin();const {studentId}=await params;return NextResponse.json(await updateStudent(studentId,await request.json(),admin.id));}catch(error){if(error instanceof UnauthorizedError)return NextResponse.json({error:error.message},{status:403});return NextResponse.json({error:'Não foi possível atualizar o aluno.'},{status:400});}}

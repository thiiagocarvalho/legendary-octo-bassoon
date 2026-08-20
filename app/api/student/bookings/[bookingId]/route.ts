import { NextResponse } from 'next/server';
import { requireStudent } from '../../../../../lib/auth';
import { BookingError, cancelBooking } from '../../../../../server/services/bookings';
export async function DELETE(_: Request, { params }: { params: Promise<{ bookingId: string }> }) { const user = await requireStudent(); if (!user.studentId) return NextResponse.json({ error: 'Perfil de aluno não vinculado.' }, { status: 403 }); try { const { bookingId } = await params; return NextResponse.json(await cancelBooking(user.studentId, bookingId)); } catch (error) { if (error instanceof BookingError) return NextResponse.json({ error: error.code }, { status: 409 }); throw error; } }

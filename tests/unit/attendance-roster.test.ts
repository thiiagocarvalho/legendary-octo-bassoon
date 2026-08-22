import { describe, expect, it } from 'vitest';
import { buildAttendanceRoster } from '../../server/services/attendance-roster';

describe('attendance roster', () => {
  it('lists enrolled students even when they have not reserved the occurrence', () => {
    const roster = buildAttendanceRoster(
      [{ student: { id: 'student-1', fullName: 'Janaína Ribeiro' } }],
      [],
    );

    expect(roster).toEqual([
      { student: { id: 'student-1', fullName: 'Janaína Ribeiro' }, bookingId: null, status: 'RESERVED' },
    ]);
  });

  it('keeps the recorded attendance when the student already has a booking', () => {
    const roster = buildAttendanceRoster(
      [{ student: { id: 'student-1', fullName: 'Janaína Ribeiro' } }],
      [{ id: 'booking-1', studentId: 'student-1', status: 'PRESENT' }],
    );

    expect(roster[0]).toEqual({
      student: { id: 'student-1', fullName: 'Janaína Ribeiro' },
      bookingId: 'booking-1',
      status: 'PRESENT',
    });
  });
});

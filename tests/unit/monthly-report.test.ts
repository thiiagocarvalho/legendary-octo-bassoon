import { describe, expect, it } from 'vitest';
import { buildMonthlyReport } from '../../server/services/monthly-report';

describe('buildMonthlyReport', () => {
  it('summarizes the selected month for the studio owner', () => {
    const report = buildMonthlyReport({
      activeStudents: 8,
      receivedCents: 125000,
      pendingInvoices: 2,
      credits: [{ status: 'AVAILABLE' }, { status: 'USED' }, { status: 'USED' }],
      bookings: [
        { studentId: 'ana', fullName: 'Ana', status: 'PRESENT' },
        { studentId: 'ana', fullName: 'Ana', status: 'ABSENT' },
        { studentId: 'bia', fullName: 'Bia', status: 'PRESENT' },
      ],
    });

    expect(report).toMatchObject({
      activeStudents: 8,
      receivedCents: 125000,
      pendingInvoices: 2,
      availableCredits: 1,
      usedCredits: 2,
      present: 2,
      absent: 1,
    });
    expect(report.attendance).toEqual([
      { studentId: 'ana', fullName: 'Ana', present: 1, absent: 1 },
      { studentId: 'bia', fullName: 'Bia', present: 1, absent: 0 },
    ]);
  });
});

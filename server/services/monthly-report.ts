export type MonthlyReportBooking = {
  studentId: string;
  fullName: string;
  status: string;
};

export type MonthlyReportCredit = { status: 'AVAILABLE' | 'USED' | string };

export type MonthlyReportInput = {
  activeStudents: number;
  receivedCents: number;
  pendingInvoices: number;
  credits: MonthlyReportCredit[];
  bookings: MonthlyReportBooking[];
};

export type MonthlyAttendanceRow = {
  studentId: string;
  fullName: string;
  present: number;
  absent: number;
};

export function buildMonthlyReport(input: MonthlyReportInput) {
  const attendanceByStudent = input.bookings.reduce<Record<string, MonthlyAttendanceRow>>((all, booking) => {
    if (booking.status !== 'PRESENT' && booking.status !== 'ABSENT') return all;
    const row = all[booking.studentId] ?? { studentId: booking.studentId, fullName: booking.fullName, present: 0, absent: 0 };
    row[booking.status === 'PRESENT' ? 'present' : 'absent'] += 1;
    all[booking.studentId] = row;
    return all;
  }, {});

  const attendance = Object.values(attendanceByStudent);
  return {
    activeStudents: input.activeStudents,
    receivedCents: input.receivedCents,
    pendingInvoices: input.pendingInvoices,
    availableCredits: input.credits.filter((credit) => credit.status === 'AVAILABLE').length,
    usedCredits: input.credits.filter((credit) => credit.status === 'USED').length,
    present: input.bookings.filter((booking) => booking.status === 'PRESENT').length,
    absent: input.bookings.filter((booking) => booking.status === 'ABSENT').length,
    attendance,
  };
}

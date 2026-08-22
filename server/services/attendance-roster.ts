type EnrolledStudent = {
  student: { id: string; fullName: string };
};

type AttendanceBooking = {
  id: string;
  studentId: string;
  status: string;
};

export function buildAttendanceRoster(enrollments: EnrolledStudent[], bookings: AttendanceBooking[]) {
  return enrollments.map(({ student }) => {
    const booking = bookings.find((item) => item.studentId === student.id);

    return {
      student,
      bookingId: booking?.id ?? null,
      status: booking?.status ?? 'RESERVED',
    };
  });
}

type EnrollmentStart = { studentId: string; fullName: string; startedAt: Date };

export function pilatesAnniversaries(enrollments: EnrollmentStart[], now = new Date()) {
  const firstEnrollment = new Map<string, EnrollmentStart>();
  for (const enrollment of enrollments) {
    const current = firstEnrollment.get(enrollment.studentId);
    if (!current || enrollment.startedAt < current.startedAt) firstEnrollment.set(enrollment.studentId, enrollment);
  }
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const limit = new Date(today); limit.setDate(limit.getDate() + 7);
  return [...firstEnrollment.values()].map((enrollment) => {
    const anniversaryDate = new Date(now.getFullYear(), enrollment.startedAt.getMonth(), enrollment.startedAt.getDate());
    return { id: enrollment.studentId, fullName: enrollment.fullName, years: now.getFullYear() - enrollment.startedAt.getFullYear(), anniversaryDate };
  }).filter((anniversary) => anniversary.years > 0 && anniversary.anniversaryDate >= today && anniversary.anniversaryDate <= limit)
    .sort((first, second) => first.anniversaryDate.getTime() - second.anniversaryDate.getTime())
    .map((anniversary) => ({ ...anniversary, anniversaryDate: anniversary.anniversaryDate.toISOString() }));
}

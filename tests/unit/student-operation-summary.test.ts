import { describe, expect, it } from 'vitest';
import { attendanceSummary } from '../../lib/student-operation-summary';

describe('attendanceSummary', () => {
  it('calcula a frequência apenas por presenças e faltas', () => {
    expect(attendanceSummary(['PRESENT', 'ABSENT', 'RESERVED'])).toEqual({ present: 1, absent: 1, percentage: 50 });
  });
});

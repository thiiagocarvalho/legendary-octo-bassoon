import { describe, expect, it } from 'vitest';
import { attendanceButtonClass } from '../../lib/attendance-display';

describe('attendance button display', () => {
  it('highlights the selected present button in green', () => {
    expect(attendanceButtonClass('PRESENT', 'PRESENT')).toContain('bg-emerald-700');
  });

  it('highlights the selected absent button in red', () => {
    expect(attendanceButtonClass('ABSENT', 'ABSENT')).toContain('bg-red-700');
  });
});

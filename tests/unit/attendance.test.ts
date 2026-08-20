import { describe, expect, it } from 'vitest';
import { isAttendanceStatus } from '../../server/services/attendance';

describe('attendance status', () => {
  it('accepts only statuses that an administrator can record', () => {
    expect(isAttendanceStatus('PRESENT')).toBe(true);
    expect(isAttendanceStatus('RESERVED')).toBe(false);
  });
});

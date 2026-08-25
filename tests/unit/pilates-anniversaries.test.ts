import { describe, expect, it } from 'vitest';
import { pilatesAnniversaries } from '../../lib/pilates-anniversaries';

describe('aniversários de Pilates', () => {
  it('avisa a quantidade de anos completada nos próximos sete dias', () => {
    const now = new Date('2026-08-25T12:00:00');
    const anniversaries = pilatesAnniversaries([
      { studentId: 'student_1', fullName: 'Ana', startedAt: new Date('2024-08-27T09:00:00') },
      { studentId: 'student_2', fullName: 'Bia', startedAt: new Date('2025-08-31T09:00:00') },
      { studentId: 'student_3', fullName: 'Cida', startedAt: new Date('2024-07-10T09:00:00') },
    ], now);

    expect(anniversaries).toEqual([
      { id: 'student_1', fullName: 'Ana', years: 2, anniversaryDate: '2026-08-27T03:00:00.000Z' },
      { id: 'student_2', fullName: 'Bia', years: 1, anniversaryDate: '2026-08-31T03:00:00.000Z' },
    ]);
  });
});

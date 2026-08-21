import { describe, expect, it } from 'vitest';
import { latestDashboardMessages } from '../../server/services/dashboard-messages';

describe('latestDashboardMessages', () => {
  it('keeps only the five most recent messages for the dashboard', () => {
    const messages = Array.from({ length: 6 }, (_, index) => ({
      id: String(index + 1),
      student: { fullName: `Aluno ${index + 1}` },
      content: `Mensagem ${index + 1}`,
      createdAt: new Date(2026, 0, index + 1),
    }));

    expect(latestDashboardMessages(messages).map((message) => message.id)).toEqual(['6', '5', '4', '3', '2']);
  });
});

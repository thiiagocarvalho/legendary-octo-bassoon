import { describe, expect, it } from 'vitest';
import { adminNavigationLinks, studentNavigationLinks } from '../../components/navigation/navigation-links';

describe('responsive navigation links', () => {
  it('keeps every administrative destination available in the mobile menu', () => {
    expect(adminNavigationLinks.map((item) => item.href)).toContain('/admin/chamada');
    expect(adminNavigationLinks).toHaveLength(8);
  });

  it('keeps the student app navigation simple', () => {
    expect(studentNavigationLinks.map((item) => item.label)).toEqual(['Meu Pilates', 'Agenda', 'Mensalidade']);
  });
});

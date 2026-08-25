import { describe, expect, it } from 'vitest';
import { employeeNavigationLinks } from '../../components/navigation/navigation-links';

describe('employee navigation', () => {
  it('shows only operational destinations to an employee', () => {
    expect(employeeNavigationLinks.map((item) => item.href)).toEqual([
      '/admin/alunos', '/admin/turmas', '/admin/agenda', '/admin/remarcacoes', '/admin/chamada',
    ]);
  });
});

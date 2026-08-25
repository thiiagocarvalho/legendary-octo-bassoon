import { describe, expect, it } from 'vitest';
import { studentRestrictionsSummary } from '../../lib/student-restrictions';

describe('resumo de restrições do aluno', () => {
  it('mostra uma mensagem clara quando não há restrições preenchidas', () => {
    expect(studentRestrictionsSummary(null)).toBe('Nenhuma restrição registrada.');
    expect(studentRestrictionsSummary('   ')).toBe('Nenhuma restrição registrada.');
  });

  it('preserva o texto cadastrado da restrição', () => {
    expect(studentRestrictionsSummary('Evitar flexão profunda do joelho.')).toBe('Evitar flexão profunda do joelho.');
  });
});

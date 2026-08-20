import { describe, expect, it } from 'vitest';
import { studentCreationErrorMessage } from '../../lib/student-creation-errors';

describe('studentCreationErrorMessage', () => {
  it('informa quando o e-mail já está em uso', () => {
    expect(studentCreationErrorMessage({ code: 'P2002' })).toBe('Já existe um acesso com este e-mail.');
  });

  it('mantém a mensagem de validação para o formulário', () => {
    expect(studentCreationErrorMessage({ issues: [{ message: 'Informe e-mail e senha juntos para criar o acesso do aluno.' }] }))
      .toBe('Informe e-mail e senha juntos para criar o acesso do aluno.');
  });
});

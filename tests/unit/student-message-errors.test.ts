import { describe, expect, it } from 'vitest';
import { studentMessageError } from '../../lib/student-message-errors';

describe('studentMessageError', () => {
  it('mostra o motivo devolvido pela API', () => {
    expect(studentMessageError({ error: 'Escreva uma mensagem.' })).toBe('Escreva uma mensagem.');
  });

  it('usa uma mensagem amigável quando a API não devolve detalhe', () => {
    expect(studentMessageError(null)).toBe('Não foi possível enviar a mensagem. Tente novamente.');
  });
});

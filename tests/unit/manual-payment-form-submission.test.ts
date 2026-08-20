import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = readFileSync(new URL('../../components/finance/manual-payment-form.tsx', import.meta.url), 'utf8');

describe('formulário de registro de mensalidade', () => {
  it('identifica os campos e guarda o formulário antes da requisição', () => {
    expect(source).toContain('Aluno');
    expect(source).toContain('Forma de pagamento');
    expect(source).toContain('Meses pagos');
    expect(source).toContain('Valor recebido');
    expect(source).toContain('Observação');
    expect(source).toMatch(/const formElement\s*=\s*\w+\.currentTarget;/);
    expect(source).toMatch(/new FormData\(formElement\)/);
    expect(source).toMatch(/formElement\.reset\(\)/);
  });
});

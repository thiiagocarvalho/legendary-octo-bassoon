import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = readFileSync(new URL('../../components/plans/plan-form.tsx', import.meta.url), 'utf8');

describe('envio do formulário de planos', () => {
  it('guarda o formulário antes da requisição e o limpa após o cadastro', () => {
    expect(source).toMatch(/const formElement\s*=\s*\w+\.currentTarget;/);
    expect(source).toMatch(/new FormData\(formElement\)/);
    expect(source).toMatch(/formElement\.reset\(\)/);
  });
});

import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';

describe('envio de evolução funcional', () => {
  it('guarda o formulário antes da operação assíncrona para poder limpá-lo com segurança', async () => {
    const source = await readFile(new URL('../../components/students/progress-form.tsx', import.meta.url), 'utf8');

    expect(source).toMatch(/const formElement\s*=\s*event\.currentTarget;/);
    expect(source).toMatch(/new FormData\(formElement\)/);
    expect(source).toMatch(/formElement\.reset\(\)/);
  });
});

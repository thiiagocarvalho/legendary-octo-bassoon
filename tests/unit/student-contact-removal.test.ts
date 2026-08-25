import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('remoção do contato manual com o estúdio', () => {
  it('remove os pontos de envio e listagem de mensagens comuns', () => {
    expect(existsSync(join(process.cwd(), 'components/student/message-form.tsx'))).toBe(false);
    expect(existsSync(join(process.cwd(), 'app/api/student/messages/route.ts'))).toBe(false);
    expect(existsSync(join(process.cwd(), 'app/admin/mensagens/page.tsx'))).toBe(false);
    expect(readFileSync(join(process.cwd(), 'app/aluno/page.tsx'), 'utf8')).not.toContain('MessageForm');
    expect(readFileSync(join(process.cwd(), 'components/dashboard/dashboard-cards.tsx'), 'utf8')).not.toContain('Mensagens dos alunos');
  });
});

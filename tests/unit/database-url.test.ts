import { describe, expect, it } from 'vitest';
import { prismaDatabaseUrl } from '../../lib/database-url';

describe('prismaDatabaseUrl', () => {
  it('configura o Prisma para o pooler do Supabase', () => {
    expect(prismaDatabaseUrl('postgresql://postgres.project:senha@aws-0-sa-east-1.pooler.supabase.com:6543/postgres'))
      .toBe('postgresql://postgres.project:senha@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1');
  });

  it('mantém conexões diretas sem alteração', () => {
    expect(prismaDatabaseUrl('postgresql://postgres:senha@db.project.supabase.co:5432/postgres'))
      .toBe('postgresql://postgres:senha@db.project.supabase.co:5432/postgres');
  });
});

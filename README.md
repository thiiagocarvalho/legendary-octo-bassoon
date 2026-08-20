# Pilates Gestão

CRM para estúdio de Pilates com administração, agenda, reservas, ficha funcional e mensalidades.

## Configuração

Crie `.env.local`:

```env
DATABASE_URL=postgresql://...
AUTH_SECRET=uma-chave-longa-e-aleatoria
SEED_ADMIN_PASSWORD=uma-senha-inicial-segura
```

Execute `pnpm db:generate`, `pnpm db:deploy` e `pnpm db:seed`. Para ambiente local, use `pnpm db:migrate` ao criar novas migrações.

O administrador inicial usa o e-mail `admin@pilates.local` e a senha definida em `SEED_ADMIN_PASSWORD`.

## Primeiro uso

1. Entre como administrador em `/login`.
2. Crie o plano padrão com limite de `2` aulas por semana.
3. Cadastre o aluno e, se desejar liberar o portal, informe e-mail e senha inicial juntos.
4. Na ficha do aluno, escolha o plano. A primeira mensalidade é gerada como pendente.
5. No Financeiro, confirme o recebimento presencial por Pix, Dinheiro ou Cartão; informe o valor e quantos meses foram quitados.
6. Cadastre as turmas fixas. O sistema gera automaticamente as próximas oito ocorrências.

Em Financeiro, use **Gerar mensalidades do mês**. A competência mensal é única por matrícula, portanto a operação pode ser repetida sem gerar cobrança duplicada.

## Verificação

```bash
pnpm test -- --run
pnpm build
pnpm db:deploy
```

## Pagamentos

Os pagamentos são confirmados presencialmente pelo administrador. O CRM registra Pix, Dinheiro ou Cartão presencial, o valor efetivamente recebido e a quantidade de competências quitadas; o aluno consulta somente o estado de suas mensalidades.

Veja o guia completo de publicação em [docs/DEPLOY.md](docs/DEPLOY.md).

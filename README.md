# Pilates Gestão

CRM para estúdio de Pilates com administração, agenda, reservas, ficha funcional e mensalidades.

## Configuração

Crie `.env.local`:

```env
DATABASE_URL=postgresql://...
AUTH_SECRET=uma-chave-longa-e-aleatoria
SEED_ADMIN_PASSWORD=uma-senha-inicial-segura
APP_URL=https://seu-dominio.com
MERCADO_PAGO_ACCESS_TOKEN=
MERCADO_PAGO_WEBHOOK_SECRET=
```

Execute `pnpm db:generate`, `pnpm db:deploy` e `pnpm db:seed`. Para ambiente local, use `pnpm db:migrate` ao criar novas migrações.

O administrador inicial usa o e-mail `admin@pilates.local` e a senha definida em `SEED_ADMIN_PASSWORD`.

## Primeiro uso

1. Entre como administrador em `/login`.
2. Crie o plano padrão com limite de `2` aulas por semana.
3. Cadastre o aluno e, se desejar liberar o portal, informe e-mail e senha inicial juntos.
4. Na ficha do aluno, escolha o plano. A primeira mensalidade é gerada como pendente.
5. O aluno acessa a área dele e inicia o pagamento; a matrícula só fica ativa quando o webhook recebe o pagamento aprovado.
6. Cadastre as turmas fixas. O sistema gera automaticamente as próximas oito ocorrências.

Em Financeiro, use **Gerar mensalidades do mês**. A competência mensal é única por matrícula, portanto a operação pode ser repetida sem gerar cobrança duplicada.

## Verificação

```bash
pnpm test -- --run
pnpm build
pnpm db:deploy
```

## Pagamentos

Cadastre no Mercado Pago o webhook HTTPS `https://seu-dominio.com/api/payments/webhook`. Configure o token de acesso e a assinatura de webhook nas variáveis de ambiente. O sistema cria uma preferência de Checkout Pro para cada fatura e só marca como paga após receber webhook assinado e pagamento aprovado. O Checkout Pro oferece Pix e cartão sem que o CRM armazene dados de cartão.

Antes de publicar, defina `APP_URL` com o domínio HTTPS definitivo; URLs locais não recebem notificações de pagamento do Mercado Pago.

Veja o guia completo de publicação em [docs/DEPLOY.md](docs/DEPLOY.md).

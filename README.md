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

## Pagamentos

Cadastre no Mercado Pago o webhook HTTPS `https://seu-dominio.com/api/payments/webhook`. Configure o token de acesso e a assinatura de webhook nas variáveis de ambiente. O sistema cria uma preferência de Checkout Pro para cada fatura e só marca como paga após receber webhook assinado e pagamento aprovado.

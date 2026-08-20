# Publicação do Pilates Gestão

## 1. Preparar o ambiente

No provedor de hospedagem, crie estas variáveis de ambiente. Nunca registre os valores no Git nem os envie pelo chat.

```env
DATABASE_URL=postgresql://...
AUTH_SECRET=<chave-aleatoria-longa>
SEED_ADMIN_PASSWORD=<senha-inicial-do-administrador>
APP_URL=https://seu-dominio.com
MERCADO_PAGO_ACCESS_TOKEN=<token-de-producao>
MERCADO_PAGO_WEBHOOK_SECRET=<assinatura-secreta-do-webhook>
```

Para gerar uma chave de sessão, execute localmente:

```bash
openssl rand -base64 32
```

## 2. Banco de dados

Com `DATABASE_URL` configurada, aplique o schema e crie o administrador inicial:

```bash
pnpm db:generate
pnpm db:deploy
pnpm db:seed
```

O acesso inicial é `admin@pilates.local` com a senha usada em `SEED_ADMIN_PASSWORD`.

## 3. Hospedar

Publique a branch `main` em uma plataforma que execute Next.js. Use o comando de build padrão:

```bash
pnpm build
```

Após a primeira publicação, copie a URL HTTPS pública e defina-a como `APP_URL`. Faça uma nova publicação para a alteração entrar em vigor.

## 4. Configurar Mercado Pago

No painel Mercado Pago, configure a URL de notificações:

```text
https://seu-dominio.com/api/payments/webhook
```

Use as credenciais de produção somente no ambiente publicado. O CRM valida a assinatura do webhook e só marca a fatura como paga após receber um pagamento aprovado.

## 5. Verificação operacional

1. Entre como administrador.
2. Crie o plano de duas aulas por semana.
3. Cadastre um aluno com e-mail e senha inicial.
4. Vincule o plano; a primeira fatura ficará pendente.
5. Entre como aluno, inicie o checkout e conclua um pagamento de teste autorizado pelo seu ambiente Mercado Pago.
6. Confirme que a fatura fica `PAID` e que a matrícula passa para `ACTIVE`.
7. Crie uma turma e teste reserva, troca e cancelamento antes da janela de duas horas.

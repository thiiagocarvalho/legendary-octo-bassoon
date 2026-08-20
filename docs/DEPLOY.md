# Publicação do Pilates Gestão

## 1. Preparar o ambiente

No provedor de hospedagem, crie estas variáveis de ambiente. Nunca registre os valores no Git nem os envie pelo chat.

```env
DATABASE_URL=postgresql://...
AUTH_SECRET=<chave-aleatoria-longa>
SEED_ADMIN_PASSWORD=<senha-inicial-do-administrador>
NEXTAUTH_URL=https://seu-dominio.com
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

## 4. Verificação operacional

1. Entre como administrador.
2. Crie o plano de duas aulas por semana.
3. Cadastre um aluno com e-mail e senha inicial.
4. Vincule o plano; a primeira fatura ficará pendente.
5. No Financeiro, registre um recebimento presencial por Pix, Dinheiro ou Cartão e informe os meses quitados.
6. Confirme que as faturas ficam `PAID` e que a matrícula passa para `ACTIVE`.
7. Crie uma turma e teste reserva, troca e cancelamento antes da janela de duas horas.

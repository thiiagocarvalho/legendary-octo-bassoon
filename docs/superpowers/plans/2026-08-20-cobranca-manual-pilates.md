# Cobrança Manual para o Pilates Gestão Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Substituir checkout online por recibos presenciais que quitam uma ou mais mensalidades em sequência.

**Architecture:** Um serviço transacional seleciona faturas pendentes ou atrasadas por competência, gera competências futuras quando necessário e cria um recibo manual vinculado às faturas quitadas. Somente a área administrativa grava recebimentos; o aluno lê suas próprias faturas.

**Tech Stack:** Next.js App Router, TypeScript, Prisma/PostgreSQL, Zod, React e Vitest.

**Spec:** `docs/superpowers/specs/2026-08-20-cobranca-manual-pilates-design.md`

## Global Constraints

- Remover Mercado Pago, checkout, webhook, `APP_URL` e credenciais de pagamento.
- Aceitar apenas `PIX`, `CASH` e `CARD_IN_PERSON`.
- Validar meses de 1 a 24 e valor em centavos positivo.
- Quitar pendências cronologicamente antes de competências futuras.
- Criar/alterar recibo somente como administrador e registrar `AuditLog`.
- Não entregar recibos administrativos ao aluno.

---

### Task 1: Schema, migração e validação

**Files:**

- Modify: `prisma/schema.prisma`, `package.json`, `.env.example`, `README.md`
- Create: `prisma/migrations/<timestamp>_add_manual_payments/migration.sql`, `lib/validation/manual-payments.ts`, `tests/unit/manual-payment-validation.test.ts`

**Interfaces:** Produz enum `ManualPaymentMethod`, modelos `ManualPayment`/`ManualPaymentInvoice` e `manualPaymentInput`.

- [ ] **Step 1: Escrever teste que falha**

```ts
expect(manualPaymentInput.safeParse({ enrollmentId: 'enr_1', method: 'PIX', monthsCovered: 3, amountCents: 90000 }).success).toBe(true);
expect(manualPaymentInput.safeParse({ enrollmentId: 'enr_1', method: 'TRANSFER', monthsCovered: 1, amountCents: 30000 }).success).toBe(false);
```

- [ ] **Step 2: Confirmar a falha**

Run: `node node_modules/vitest/vitest.mjs run tests/unit/manual-payment-validation.test.ts`

Expected: falha porque `manualPaymentInput` não existe.

- [ ] **Step 3: Criar schema Zod e schema Prisma**

```ts
export const manualPaymentInput = z.object({ enrollmentId: z.string().min(1), method: z.enum(['PIX', 'CASH', 'CARD_IN_PERSON']), monthsCovered: z.coerce.number().int().min(1).max(24), amountCents: z.coerce.number().int().positive(), notes: z.string().trim().max(1000).optional(), receivedAt: z.coerce.date().optional() });
```

Add `ManualPayment` e relação `ManualPaymentInvoice`; remova `checkoutUrl`/`externalId` de `Invoice` e a dependência `mercadopago`.

- [ ] **Step 4: Verificar e commitar**

Run: `node node_modules/vitest/vitest.mjs run tests/unit/manual-payment-validation.test.ts && node node_modules/prisma/build/index.js generate`

Commit: `git commit -m "feat: add manual payment data model"`

### Task 2: Serviço transacional de quitação

**Files:**

- Create: `server/services/manual-payments.ts`, `tests/unit/manual-payment-selection.test.ts`, `tests/integration/manual-payments.test.ts`
- Modify: `server/services/invoices.ts`

**Interfaces:** Produz `selectInvoicesForManualPayment(invoices, monthsCovered)` e `recordManualPayment(input, actorId)`.

- [ ] **Step 1: Escrever teste cronológico que falha**

```ts
const selected = selectInvoicesForManualPayment([{ id: 'aug', referenceMonth: new Date('2026-08-01'), status: 'OVERDUE' }, { id: 'sep', referenceMonth: new Date('2026-09-01'), status: 'PENDING' }], 2);
expect(selected.map((invoice) => invoice.id)).toEqual(['aug', 'sep']);
```

- [ ] **Step 2: Confirmar a falha**

Run: `node node_modules/vitest/vitest.mjs run tests/unit/manual-payment-selection.test.ts`

Expected: falha porque o serviço não existe.

- [ ] **Step 3: Implementar transação**

```ts
export async function recordManualPayment(input: unknown, actorId: string) { const data = manualPaymentInput.parse(input); return prisma.$transaction(async (tx) => { /* seleciona faturas, faz upsert de futuras, quita, cria recibo/vínculos, ativa matrícula e audita */ }); }
```

Use a chave única `[enrollmentId, referenceMonth]`, preserve o valor efetivamente recebido e relacione exatamente `monthsCovered` faturas ao recibo.

- [ ] **Step 4: Escrever integração**

```ts
const payment = await recordManualPayment({ enrollmentId, method: 'PIX', monthsCovered: 3, amountCents: 90000 }, 'admin_1');
expect(payment.invoices).toHaveLength(3);
expect(await enrollmentStatus(enrollmentId)).toBe('ACTIVE');
```

- [ ] **Step 5: Verificar e commitar**

Run: `node node_modules/vitest/vitest.mjs run tests/unit/manual-payment-selection.test.ts tests/integration/manual-payments.test.ts`

Commit: `git commit -m "feat: record manual payments across monthly invoices"`

### Task 3: Rotas e financeiro administrativo

**Files:**

- Create: `app/api/admin/manual-payments/route.ts`, `components/finance/manual-payment-form.tsx`, `components/finance/manual-payment-history.tsx`
- Modify: `app/admin/financeiro/page.tsx`
- Test: `tests/integration/manual-payment-route.test.ts`

**Interfaces:** Produz `GET` e `POST /api/admin/manual-payments` protegidos por `requireAdmin`.

- [ ] **Step 1: Escrever teste de autorização que falha**

```ts
await expect(POST(requestForStudent())).resolves.toMatchObject({ status: 403 });
```

- [ ] **Step 2: Implementar rota e formulário**

```ts
export async function POST(request: Request) { const admin = await requireAdmin(); return NextResponse.json(await recordManualPayment(await request.json(), admin.id), { status: 201 }); }
```

Formulário: matrícula, Pix/Dinheiro/Cartão presencial, meses, valor e observação; exibir valor esperado. Listas: faturas e recibos com aluno, forma, meses, valor e responsável.

- [ ] **Step 3: Verificar e commitar**

Run: `node node_modules/vitest/vitest.mjs run tests/integration/manual-payment-route.test.ts && node node_modules/next/dist/bin/next build`

Commit: `git commit -m "feat: add administrative manual payment controls"`

### Task 4: Portal somente leitura e remoção online

**Files:**

- Modify: `components/student/invoice-list.tsx`, `app/aluno/financeiro/page.tsx`, `app/api/student/invoices/route.ts`, `README.md`, `docs/DEPLOY.md`
- Delete: `app/api/student/invoices/[invoiceId]/checkout/route.ts`, `app/api/payments/webhook/route.ts`, `server/payments/mercado-pago.ts`, `server/payments/port.ts`
- Create: `tests/unit/student-finance.test.ts`

**Interfaces:** Portal retorna apenas faturas próprias e não cria recebimentos.

- [ ] **Step 1: Escrever teste que falha**

```ts
expect(studentInvoiceAction('PENDING')).toBeNull();
```

- [ ] **Step 2: Remover checkout e apresentar somente status**

Remova botão, `POST` de checkout e redirecionamento. Mostre competência, vencimento, valor e estado. Delete endpoints/adaptadores Mercado Pago e toda configuração relacionada.

- [ ] **Step 3: Verificar remoção e commitar**

Run: `node node_modules/vitest/vitest.mjs run tests/unit/student-finance.test.ts && rg -n "MercadoPago|MERCADO_PAGO|checkoutUrl|/api/payments/webhook|APP_URL" app components lib server prisma package.json .env.example README.md docs/DEPLOY.md`

Expected: teste passa e a busca não encontra integração online.

Commit: `git commit -m "feat: replace online checkout with manual payment status"`

### Task 5: Aplicação no banco e verificação final

**Files:**

- Modify: `README.md`, `docs/DEPLOY.md`
- Test: `tests/unit/*.test.ts`

**Interfaces:** Produz schema remoto atualizado e instruções de operação presencial.

- [ ] **Step 1: Aplicar migration**

Run: `set -a; source .env.local; set +a; node node_modules/prisma/build/index.js migrate deploy`

Expected: migration aplicada sem apagar faturas existentes.

- [ ] **Step 2: Executar testes e build**

Run: `node node_modules/vitest/vitest.mjs run && node node_modules/next/dist/bin/next build`

Expected: todos os testes e build passam.

- [ ] **Step 3: Confirmar schema remoto**

Run: `set -a; source .env.local; set +a; node node_modules/prisma/build/index.js migrate status`

Expected: `Database schema is up to date`.

- [ ] **Step 4: Commit final**

Commit: `git commit -m "docs: update manual billing operation"`

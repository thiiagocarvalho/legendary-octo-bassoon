# Operação, reposições e relatórios Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar presença por aluno, créditos de reposição, avisos gratuitos por WhatsApp, relatórios mensais e histórico automático de ações ao CRM.

**Architecture:** O Prisma armazenará créditos de reposição vinculados a uma falta e, quando usados, à reserva de reposição. Serviços de domínio manterão as regras de capacidade, autenticação e auditoria; páginas administrativas e o portal do aluno apenas consumirão essas rotas. Relatórios serão calculados no servidor a partir de pagamentos, faturas, reservas e créditos no período selecionado.

**Tech Stack:** Next.js App Router, TypeScript, React, Prisma, PostgreSQL, Vitest e Tailwind CSS.

**Spec:** `docs/superpowers/specs/2026-08-21-operacao-e-relatorios-design.md`

## Global Constraints

- Reposição ocupa somente uma vaga já disponível e nunca cria vaga extra.
- Aluno usa apenas os próprios créditos e somente pela agenda autenticada.
- Avisos usam somente links `wa.me` em nova aba; nenhuma API paga ou envio automático.
- Somente administradores criam/cancelam créditos, veem relatórios e apagam histórico administrativo.
- Toda alteração relevante gera `AuditLog` com responsável, entidade e descrição.

---

### Task 1: Persistir créditos de reposição e a auditoria de presença

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/<timestamp>_add_makeup_credits/migration.sql`
- Modify: `server/services/attendance.ts`
- Test: `tests/unit/makeup-credit-rules.test.ts`

**Interfaces:**
- Produces `MakeupCredit { id, studentId, sourceBookingId, usedBookingId?, status, createdAt, usedAt? }`.
- Produces `createMakeupCredit(studentId, sourceBookingId, actorId)` and `consumeMakeupCredit(studentId, bookingId, tx)`.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest';
import { canUseMakeupCredit } from '../../server/services/makeup-credit-rules';

describe('canUseMakeupCredit', () => {
  it('permite apenas um crédito disponível', () => {
    expect(canUseMakeupCredit({ status: 'AVAILABLE' })).toBe(true);
    expect(canUseMakeupCredit({ status: 'USED' })).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node node_modules/vitest/vitest.mjs run tests/unit/makeup-credit-rules.test.ts`

Expected: FAIL because `makeup-credit-rules` does not exist.

- [ ] **Step 3: Write minimal implementation**

```ts
export function canUseMakeupCredit(credit: { status: 'AVAILABLE' | 'USED' | 'CANCELED' }) {
  return credit.status === 'AVAILABLE';
}
```

Add the `MakeupCreditStatus` enum and `MakeupCredit` model to Prisma with unique `sourceBookingId`, optional unique `usedBookingId`, and relations to `Student` and `Booking`. In `recordAttendance`, when status is `ABSENT`, create an audit log; expose a service that creates one available credit only for an absent booking and logs `MAKEUP_CREDIT_CREATED`.

- [ ] **Step 4: Run test and database migration**

Run: `node node_modules/vitest/vitest.mjs run tests/unit/makeup-credit-rules.test.ts && node node_modules/prisma/build/index.js migrate deploy && node node_modules/prisma/build/index.js generate`

Expected: test PASS; migration and Prisma generation complete without errors.

- [ ] **Step 5: Commit**

```bash
git add prisma server/services tests/unit/makeup-credit-rules.test.ts
git commit -m "feat: add makeup credits for absences"
```

### Task 2: Criar e consumir reposições com as regras de reserva existentes

**Files:**
- Modify: `server/services/bookings.ts`
- Create: `server/services/makeup-credits.ts`
- Create: `app/api/admin/bookings/[bookingId]/makeup-credit/route.ts`
- Create: `app/api/student/makeup-credits/route.ts`
- Modify: `app/api/student/bookings/route.ts`
- Test: `tests/unit/makeup-booking.test.ts`
- Test: `tests/integration/makeup-credit-route.test.ts`

**Interfaces:**
- Consumes `consumeMakeupCredit(studentId, bookingId, tx)` from Task 1.
- Produces `createMakeupBooking(studentId, occurrenceId)` and authenticated admin/student routes.

- [ ] **Step 1: Write the failing test**

```ts
it('recusa reposição sem crédito disponível', () => {
  expect(makeupBookingDecision(0, 1, 6, 8).allowed).toBe(false);
  expect(makeupBookingDecision(1, 1, 6, 8).allowed).toBe(true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node node_modules/vitest/vitest.mjs run tests/unit/makeup-booking.test.ts`

Expected: FAIL because `makeupBookingDecision` does not exist.

- [ ] **Step 3: Write minimal implementation**

```ts
export function makeupBookingDecision(availableCredits: number, occupied: number, capacity: number) {
  if (!availableCredits) return { allowed: false, code: 'NO_MAKEUP_CREDIT' as const };
  if (occupied >= capacity) return { allowed: false, code: 'CLASS_FULL' as const };
  return { allowed: true as const };
}
```

Implement `createMakeupBooking` as a serializable Prisma transaction: load one available credit for the student, count non-cancelled reservations, reject full occurrence, create reservation, mark credit `USED` and connect `usedBookingId`, then write audit log `MAKEUP_CREDIT_USED`. Add an admin route that creates a credit only for an absent booking. Extend the student bookings POST body with `kind: 'MAKEUP'`; call `createMakeupBooking` when selected.

- [ ] **Step 4: Run tests**

Run: `node node_modules/vitest/vitest.mjs run tests/unit/makeup-booking.test.ts tests/integration/makeup-credit-route.test.ts`

Expected: PASS; test covers no credit, full class and successful consumption.

- [ ] **Step 5: Commit**

```bash
git add server/services app/api tests
git commit -m "feat: allow students to use makeup credits"
```

### Task 3: Exibir presença, reposições e histórico na agenda e na ficha

**Files:**
- Modify: `components/schedule/admin-agenda.tsx`
- Modify: `app/admin/alunos/[studentId]/page.tsx`
- Modify: `app/aluno/agenda/page.tsx`
- Modify: `components/student/booking-calendar.tsx`
- Create: `components/students/student-operation-history.tsx`
- Test: `tests/unit/student-operation-summary.test.ts`

**Interfaces:**
- Consumes bookings, `MakeupCredit` and `AuditLog` from Tasks 1–2.
- Produces `attendanceSummary(bookings)` returning present, absent and percentage.

- [ ] **Step 1: Write the failing test**

```ts
it('calculates presence only from present and absent reservations', () => {
  expect(attendanceSummary(['PRESENT', 'ABSENT', 'RESERVED'])).toEqual({ present: 1, absent: 1, percentage: 50 });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node node_modules/vitest/vitest.mjs run tests/unit/student-operation-summary.test.ts`

Expected: FAIL because `attendanceSummary` does not exist.

- [ ] **Step 3: Write minimal implementation**

```ts
export function attendanceSummary(statuses: string[]) {
  const present = statuses.filter((status) => status === 'PRESENT').length;
  const absent = statuses.filter((status) => status === 'ABSENT').length;
  return { present, absent, percentage: present + absent ? Math.round((present / (present + absent)) * 100) : 0 };
}
```

Show a “Liberar reposição” action next to an absence in the admin agenda. The student detail shows last-28-day totals, available/used credits and matching audit history. The student agenda clearly shows available credits and labels the booking action as “Usar reposição” when the student chooses it.

- [ ] **Step 4: Run test and page build**

Run: `node node_modules/vitest/vitest.mjs run tests/unit/student-operation-summary.test.ts && node node_modules/next/dist/bin/next build`

Expected: PASS; build includes `/admin/agenda`, `/admin/alunos/[studentId]` and `/aluno/agenda`.

- [ ] **Step 5: Commit**

```bash
git add components app/admin app/aluno tests/unit/student-operation-summary.test.ts
git commit -m "feat: show attendance and makeup history"
```

### Task 4: Criar avisos de vencimento com WhatsApp

**Files:**
- Create: `lib/whatsapp-payment-reminders.ts`
- Modify: `app/admin/financeiro/page.tsx`
- Create: `components/finance/payment-reminder-button.tsx`
- Test: `tests/unit/whatsapp-payment-reminders.test.ts`

**Interfaces:**
- Produces `paymentReminder(student, dueDate, now)` returning `{ label, href } | null`.

- [ ] **Step 1: Write the failing test**

```ts
it('builds a WhatsApp reminder for an invoice due tomorrow', () => {
  const reminder = paymentReminder({ fullName: 'Ana', phone: '(11) 99999-8888' }, new Date('2026-08-22T12:00:00'), new Date('2026-08-21T12:00:00'));
  expect(reminder?.href).toContain('https://wa.me/5511999998888?text=');
  expect(reminder?.label).toBe('Vence amanhã');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node node_modules/vitest/vitest.mjs run tests/unit/whatsapp-payment-reminders.test.ts`

Expected: FAIL because `paymentReminder` does not exist.

- [ ] **Step 3: Write minimal implementation**

```ts
const digits = (phone: string) => phone.replace(/\D/g, '').replace(/^55/, '');
const href = (phone: string, text: string) => `https://wa.me/55${digits(phone)}?text=${encodeURIComponent(text)}`;
```

Implement today, tomorrow and overdue messages using pt-BR date formatting. Display the link as an anchor with `target="_blank"` and `rel="noreferrer"` beside applicable invoices in Financeiro. Return `null` for invoices that are not due today/tomorrow and are not overdue.

- [ ] **Step 4: Run test and build**

Run: `node node_modules/vitest/vitest.mjs run tests/unit/whatsapp-payment-reminders.test.ts && node node_modules/next/dist/bin/next build`

Expected: PASS; finance page compiles.

- [ ] **Step 5: Commit**

```bash
git add lib components/finance app/admin/financeiro tests/unit/whatsapp-payment-reminders.test.ts
git commit -m "feat: add WhatsApp payment reminders"
```

### Task 5: Adicionar relatórios mensais e histórico auditável

**Files:**
- Create: `server/services/reports.ts`
- Create: `app/api/admin/reports/route.ts`
- Create: `app/admin/relatorios/page.tsx`
- Create: `components/reports/monthly-report.tsx`
- Modify: `app/admin/layout.tsx`
- Modify: `server/services/manual-payments.ts`
- Modify: `server/services/students.ts`
- Test: `tests/unit/monthly-report.test.ts`

**Interfaces:**
- Produces `getMonthlyReport(month: Date)` with `receivedCents`, pending invoices, overdue students, occupancy, attendance per student and makeup totals.
- Consumes audit writer `prisma.auditLog.create` for payment, enrollment and student updates.

- [ ] **Step 1: Write the failing test**

```ts
it('summarizes received payments and pending invoices', () => {
  expect(reportTotals([{ amountCents: 25000 }], ['PAID', 'PENDING', 'OVERDUE'])).toEqual({ receivedCents: 25000, pendingInvoices: 2 });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node node_modules/vitest/vitest.mjs run tests/unit/monthly-report.test.ts`

Expected: FAIL because `reportTotals` does not exist.

- [ ] **Step 3: Write minimal implementation**

```ts
export function reportTotals(payments: { amountCents: number }[], statuses: string[]) {
  return { receivedCents: payments.reduce((total, payment) => total + payment.amountCents, 0), pendingInvoices: statuses.filter((status) => status === 'PENDING' || status === 'OVERDUE').length };
}
```

Implement server-side date range filtering for the selected month and aggregate Prisma queries. Build the reports page with month input, finance summary, overdue list with WhatsApp action, occupancy, attendance rows and makeup totals. Add the “Relatórios” link to admin navigation. Write audit entries for payment confirmation, enrollment changes and student profile changes using current admin id.

- [ ] **Step 4: Run tests and full verification**

Run: `node node_modules/vitest/vitest.mjs run tests/unit/monthly-report.test.ts tests/unit/makeup-credit-rules.test.ts tests/unit/makeup-booking.test.ts tests/unit/whatsapp-payment-reminders.test.ts && node node_modules/next/dist/bin/next build`

Expected: all tests PASS and build exits 0.

- [ ] **Step 5: Commit**

```bash
git add server/services app/api/admin/reports app/admin/relatorios app/admin/layout.tsx components/reports tests/unit/monthly-report.test.ts
git commit -m "feat: add operational monthly reports"
```

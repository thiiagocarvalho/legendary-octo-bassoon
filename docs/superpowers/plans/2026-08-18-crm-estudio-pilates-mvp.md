# CRM para Estúdio de Pilates MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar um CRM web instalável para gerir alunos, agenda de Pilates, pagamentos e acompanhamento funcional de um estúdio.

**Architecture:** Um monólito Next.js com App Router entrega painel administrativo e portal do aluno, apoiado em PostgreSQL/Prisma. Regras de domínio ficam em serviços TypeScript chamados exclusivamente por route handlers/server actions; a integração Mercado Pago fica atrás de uma porta de pagamentos e é atualizada por webhook idempotente.

**Tech Stack:** Next.js 15+, TypeScript, React, Tailwind CSS, PostgreSQL, Prisma, Auth.js, Mercado Pago SDK, Zod, Vitest, Playwright, PWA manifest.

**Spec:** `docs/superpowers/specs/2026-08-18-crm-estudio-pilates-design.md`

## Global Constraints

- Há somente os papéis `ADMIN` e `STUDENT`; não criar área de instrutor no MVP.
- O plano inicial é mensal e permite duas reservas com presença por semana.
- Reservas, trocas e cancelamentos do aluno são bloqueados nas duas horas antes do início da aula.
- Dados clínicos/funcionais só podem ser lidos e alterados pelo administrador e exigem consentimento explícito.
- O aluno enxerga somente agenda, plano, pagamentos e histórico próprio.
- Dados brutos de cartão não podem ser armazenados; validar assinatura do webhook do provedor.
- Cada mudança administrativa sensível deve gerar `AuditLog` com autor, data e, quando houver ajuste manual, motivo.
- O portal do aluno deve funcionar em telas de celular e ser instalável como PWA.

---

## File structure

- `app/`: rotas, layouts e telas do painel e portal.
- `app/api/`: endpoints autenticados e endpoint público do webhook de pagamento.
- `components/`: componentes visuais pequenos e reutilizáveis.
- `lib/auth.ts`: configuração de sessão e guardas de papel.
- `lib/db.ts`: cliente Prisma único.
- `lib/validation/`: schemas Zod de entrada.
- `server/services/`: regras de domínio sem dependência de React.
- `server/payments/`: porta e adaptador Mercado Pago.
- `prisma/schema.prisma`: modelos relacionais e enums.
- `tests/unit/`: regras de domínio e permissões.
- `tests/integration/`: rotas e webhook com banco de teste.
- `tests/e2e/`: jornadas de administrador e aluno.

### Task 1: Bootstrap, banco e fundação de testes

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `tailwind.config.ts`, `vitest.config.ts`, `playwright.config.ts`, `.env.example`
- Create: `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `lib/db.ts`
- Create: `prisma/schema.prisma`, `prisma/seed.ts`
- Create: `tests/unit/smoke.test.ts`

**Interfaces:**
- Produces: `prisma` singleton exported by `lib/db.ts`; PostgreSQL URL in `DATABASE_URL`; test commands `test`, `test:watch`, `test:e2e`.

- [ ] **Step 1: Create a failing smoke test**

```ts
// tests/unit/smoke.test.ts
import { describe, expect, it } from 'vitest';

describe('test environment', () => {
  it('runs TypeScript tests', () => {
    expect('pilates-crm').toBe('ready');
  });
});
```

- [ ] **Step 2: Run the test to verify the test command is not configured**

Run: `npm test -- --run tests/unit/smoke.test.ts`

Expected: FAIL because the project and Vitest configuration do not yet exist.

- [ ] **Step 3: Scaffold the Next.js app and install dependencies**

Create the project with TypeScript, App Router and Tailwind. Install `@prisma/client prisma next-auth bcryptjs zod mercadopago`, plus dev dependencies `vitest @vitejs/plugin-react jsdom @playwright/test tsx`. Add scripts:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "lint": "next lint",
    "test": "vitest",
    "test:e2e": "playwright test",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:seed": "tsx prisma/seed.ts"
  }
}
```

Initialize Prisma with PostgreSQL. Set `app/page.tsx` to redirect to `/login`, and create a minimal root layout with `<html lang="pt-BR">`.

- [ ] **Step 4: Add initial Prisma schema and database client**

Start with the enums and models needed by every following task:

```prisma
enum Role { ADMIN STUDENT }
enum EnrollmentStatus { ACTIVE PENDING OVERDUE CANCELED }

model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  role         Role
  student      Student?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model Student {
  id        String   @id @default(cuid())
  userId    String?  @unique
  fullName  String
  phone     String
  birthDate DateTime
  user      User?    @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model AuditLog {
  id        String   @id @default(cuid())
  actorId   String
  action    String
  entity    String
  entityId  String
  reason    String?
  createdAt DateTime @default(now())
}
```

Export one development-safe Prisma instance:

```ts
import { PrismaClient } from '@prisma/client';
const globalForPrisma = globalThis as { prisma?: PrismaClient };
export const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

- [ ] **Step 5: Add configuration and seed data**

Document `DATABASE_URL`, `AUTH_SECRET`, `MERCADO_PAGO_ACCESS_TOKEN` and `MERCADO_PAGO_WEBHOOK_SECRET` in `.env.example` without values. Seed one admin whose password is read from `SEED_ADMIN_PASSWORD`; refuse to seed if it is absent.

- [ ] **Step 6: Run checks**

Run: `npm test -- --run tests/unit/smoke.test.ts && npx prisma generate && npm run build`

Expected: PASS, Prisma client generated, production build succeeds.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json app lib prisma tests .env.example next.config.ts tsconfig.json tailwind.config.ts vitest.config.ts playwright.config.ts
git commit -m "chore: bootstrap pilates CRM application"
```

### Task 2: Authentication, sessions and authorization guards

**Files:**
- Create: `lib/auth.ts`, `lib/permissions.ts`, `app/api/auth/[...nextauth]/route.ts`
- Create: `app/(auth)/login/page.tsx`, `components/auth/login-form.tsx`
- Create: `tests/unit/permissions.test.ts`, `tests/integration/auth.test.ts`

**Interfaces:**
- Consumes: `User` and `Role` from Task 1.
- Produces: `requireAdmin(): Promise<SessionUser>`, `requireStudent(): Promise<SessionUser>`, where `SessionUser = { id: string; role: Role; studentId?: string }`.

- [ ] **Step 1: Write failing permission tests**

```ts
import { describe, expect, it } from 'vitest';
import { canReadHealthProfile } from '@/lib/permissions';

describe('clinical-data permission', () => {
  it('allows only an administrator', () => {
    expect(canReadHealthProfile({ role: 'ADMIN' })).toBe(true);
    expect(canReadHealthProfile({ role: 'STUDENT', studentId: 's1' })).toBe(false);
  });
});
```

- [ ] **Step 2: Run the failing test**

Run: `npm test -- --run tests/unit/permissions.test.ts`

Expected: FAIL because `lib/permissions.ts` does not exist.

- [ ] **Step 3: Configure Auth.js credential login**

Use the email/password provider. Look up the user by email, compare `bcrypt.compare(password, user.passwordHash)`, and put `id`, `role` and `studentId` in the JWT/session. Create `requireAdmin` and `requireStudent` that redirect browser requests to `/login` and throw a typed `UnauthorizedError` in route handlers.

```ts
export function canReadHealthProfile(user: Pick<SessionUser, 'role'>) {
  return user.role === 'ADMIN';
}
```

- [ ] **Step 4: Implement a mobile-friendly login screen**

The form must have labeled email/password inputs, show invalid-credentials feedback without exposing which field failed, and redirect `ADMIN` to `/admin` and `STUDENT` to `/aluno` after login.

- [ ] **Step 5: Add integration coverage**

Mock database lookup and bcrypt. Verify wrong password returns no session, student session includes the linked student id, and unauthenticated route access returns 401.

- [ ] **Step 6: Run checks**

Run: `npm test -- --run tests/unit/permissions.test.ts tests/integration/auth.test.ts && npm run build`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add app lib components tests
git commit -m "feat: add role-based authentication"
```

### Task 3: Alunos, ficha privada e evolução funcional

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `lib/validation/students.ts`, `server/services/students.ts`, `server/services/audit.ts`
- Create: `app/admin/alunos/page.tsx`, `app/admin/alunos/[studentId]/page.tsx`, `components/students/student-form.tsx`, `components/students/health-profile-form.tsx`, `components/students/progress-form.tsx`
- Create: `app/api/admin/students/route.ts`, `app/api/admin/students/[studentId]/health/route.ts`, `app/api/admin/students/[studentId]/progress/route.ts`
- Create: `tests/unit/students.test.ts`, `tests/integration/health-profile-access.test.ts`

**Interfaces:**
- Consumes: `requireAdmin`, `prisma`, `AuditLog`.
- Produces: `createStudent(input, actorId)`, `upsertHealthProfile(input, actorId)`, `createFunctionalProgress(input, actorId)`.

- [ ] **Step 1: Write failing health visibility test**

```ts
it('rejects a student session requesting clinical data', async () => {
  const response = await GET(requestForStudent('student-user-1'), { params: { studentId: 's1' } });
  expect(response.status).toBe(403);
});
```

- [ ] **Step 2: Run the failing tests**

Run: `npm test -- --run tests/unit/students.test.ts tests/integration/health-profile-access.test.ts`

Expected: FAIL because the services and endpoints do not exist.

- [ ] **Step 3: Extend the schema and migrate**

Add immutable clinical records:

```prisma
model HealthProfile {
  id             String   @id @default(cuid())
  studentId      String   @unique
  consentedAt    DateTime
  restrictions   String
  goals          String?
  observations   String?
  student        Student  @relation(fields: [studentId], references: [id])
  updatedAt      DateTime @updatedAt
}

model FunctionalProgress {
  id        String   @id @default(cuid())
  studentId String
  note      String
  createdBy String
  createdAt DateTime @default(now())
  student   Student  @relation(fields: [studentId], references: [id])
}
```

Add reverse relations to `Student`, then run `npm run db:migrate -- --name add_student_health_data`.

- [ ] **Step 4: Implement validation and services**

Require full name, phone and date of birth for students. Reject health-profile writes unless `consentedAt` is supplied. Append progress entries; never update or delete an existing `FunctionalProgress`. Write an audit record for every health-profile update and progress creation.

```ts
export const healthProfileInput = z.object({
  consentedAt: z.coerce.date(),
  restrictions: z.string().trim().min(1).max(5000),
  goals: z.string().trim().max(5000).optional(),
  observations: z.string().trim().max(5000).optional(),
});
```

- [ ] **Step 5: Build the admin screens and routes**

List students with name, phone, birth date and enrollment status. The detail page includes profile, private health form and a reverse-chronological progression timeline. Every health route calls `requireAdmin`; do not create any student-facing health route.

- [ ] **Step 6: Run checks**

Run: `npm test -- --run tests/unit/students.test.ts tests/integration/health-profile-access.test.ts && npm run build`

Expected: PASS; the student request is 403 and an admin request can create a dated progress record.

- [ ] **Step 7: Commit**

```bash
git add prisma app components lib server tests
git commit -m "feat: add students and private functional records"
```

### Task 4: Planos, turmas, reservas e frequência

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `lib/validation/schedule.ts`, `server/services/enrollments.ts`, `server/services/bookings.ts`
- Create: `app/admin/turmas/page.tsx`, `app/admin/agenda/page.tsx`, `components/schedule/class-slot-form.tsx`, `components/schedule/attendance-list.tsx`
- Create: `app/api/admin/class-slots/route.ts`, `app/api/admin/bookings/[bookingId]/attendance/route.ts`, `app/api/student/bookings/route.ts`, `app/api/student/bookings/[bookingId]/route.ts`
- Create: `tests/unit/bookings.test.ts`, `tests/integration/student-bookings.test.ts`

**Interfaces:**
- Consumes: active `Enrollment`, `Student`, `requireAdmin`, `requireStudent`.
- Produces: `createBooking(studentId, classOccurrenceId, now)`, `changeBooking(bookingId, targetOccurrenceId, now)`, `cancelBooking(bookingId, now)`, `recordAttendance(bookingId, status, actorId)`.

- [ ] **Step 1: Write failing rule tests**

```ts
it('refuses a third attendance in the same ISO week', async () => {
  await createPresentBookings('s1', 2, '2026-08-18');
  await expect(createBooking('s1', 'occurrence-3', new Date('2026-08-18T08:00:00Z')))
    .rejects.toMatchObject({ code: 'WEEKLY_LIMIT_REACHED' });
});

it('refuses cancellation exactly two hours or less before class', async () => {
  await expect(cancelBooking('b1', new Date('2026-08-18T16:00:00Z')))
    .rejects.toMatchObject({ code: 'CHANGE_WINDOW_CLOSED' });
});
```

- [ ] **Step 2: Run the failing tests**

Run: `npm test -- --run tests/unit/bookings.test.ts tests/integration/student-bookings.test.ts`

Expected: FAIL because scheduling models and services do not exist.

- [ ] **Step 3: Add scheduling and enrollment models**

Model `Plan` with `monthlyPrice` in centavos and `weeklyBookingLimit @default(2)`, `Enrollment`, recurring `ClassSlot`, dated `ClassOccurrence`, and `Booking`. Add unique index `@@unique([studentId, occurrenceId])`; store occurrence start/end in UTC and display in `America/Sao_Paulo`.

- [ ] **Step 4: Implement atomic booking rules**

Use one Prisma transaction. Confirm `EnrollmentStatus.ACTIVE`, count bookings with `PRESENT` or `RESERVED` that start in the ISO week, check capacity, and create the reservation. For changes, lock/check the target occurrence, create target booking, then cancel the source booking in the same transaction. Admin changes require a reason and audit entry.

```ts
export type BookingErrorCode =
  | 'ENROLLMENT_INACTIVE'
  | 'WEEKLY_LIMIT_REACHED'
  | 'CLASS_FULL'
  | 'CHANGE_WINDOW_CLOSED';
```

- [ ] **Step 5: Build administration schedule screens**

Allow the admin to create recurring slots with weekday, start time, duration and capacity; materialize the next eight weeks of occurrences. On the agenda, show participant list and actions `PRESENT`, `ABSENT`, `CANCELED`; calculate occupancy from non-canceled bookings.

- [ ] **Step 6: Build secure student booking endpoints**

Use the session’s `studentId`, never a student id supplied by the client. Return available upcoming occurrences and the student’s bookings; return 409 plus a friendly code for capacity/rule conflicts.

- [ ] **Step 7: Run checks**

Run: `npm test -- --run tests/unit/bookings.test.ts tests/integration/student-bookings.test.ts && npm run build`

Expected: PASS; capacity, weekly limit, two-hour lock and atomic change are covered.

- [ ] **Step 8: Commit**

```bash
git add prisma app components lib server tests
git commit -m "feat: add schedules bookings and attendance"
```

### Task 5: Matrículas, faturas e pagamento online

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `server/payments/port.ts`, `server/payments/mercado-pago.ts`, `server/services/invoices.ts`, `server/services/payment-webhook.ts`
- Create: `app/api/admin/enrollments/route.ts`, `app/api/student/invoices/route.ts`, `app/api/payments/webhook/route.ts`
- Create: `app/admin/financeiro/page.tsx`, `components/finance/invoice-table.tsx`
- Create: `tests/unit/invoices.test.ts`, `tests/integration/payment-webhook.test.ts`

**Interfaces:**
- Consumes: `Enrollment`, payment credentials from environment.
- Produces: `PaymentGateway.createInvoice(input): Promise<GatewayInvoice>`, `verifyWebhook(request): Promise<GatewayEvent>`, `processPaymentEvent(event): Promise<void>`.

- [ ] **Step 1: Write failing webhook idempotency test**

```ts
it('marks an invoice paid once when the same signed event is delivered twice', async () => {
  await processPaymentEvent(approvedEvent('event-1', 'invoice-1'));
  await processPaymentEvent(approvedEvent('event-1', 'invoice-1'));
  expect(await countPayments('invoice-1')).toBe(1);
  expect(await invoiceStatus('invoice-1')).toBe('PAID');
});
```

- [ ] **Step 2: Run the failing tests**

Run: `npm test -- --run tests/unit/invoices.test.ts tests/integration/payment-webhook.test.ts`

Expected: FAIL because invoices and webhook processor do not exist.

- [ ] **Step 3: Add billing models and migration**

Add `Invoice`, `Payment`, and `PaymentWebhookEvent`. Invoice stores amount in centavos, due date, state `PENDING | PAID | OVERDUE | VOID`, gateway reference and checkout URL. `PaymentWebhookEvent.gatewayEventId` is unique. Use a monthly enrollment renewal job/route to generate one open invoice per active enrollment and set the enrollment to `PENDING` or `OVERDUE` when appropriate.

- [ ] **Step 4: Define and implement the payment adapter**

```ts
export interface PaymentGateway {
  createInvoice(input: {
    invoiceId: string; amountCents: number; dueDate: Date; payerEmail: string;
  }): Promise<{ externalId: string; checkoutUrl: string }>;
  verifyWebhook(headers: Headers, body: string): Promise<{
    eventId: string; externalPaymentId: string; status: 'approved' | 'rejected' | 'pending';
    externalInvoiceId: string;
  }>;
}
```

Implement the Mercado Pago adapter using its server SDK only. The webhook route reads the raw body, validates the provider signature before parsing effects, persists the event id first, and changes invoice/enrollment state only in a transaction. Never log tokens, raw card data or full webhook payloads.

- [ ] **Step 5: Build financial views**

The admin sees paid, due and overdue invoices, filters by student/status and a direct payment link. The student sees only their invoice status, due date and `Pagar agora` link. Add clear states for unavailable checkout, pending and failed payment; do not mark paid on return URL alone.

- [ ] **Step 6: Run checks**

Run: `npm test -- --run tests/unit/invoices.test.ts tests/integration/payment-webhook.test.ts && npm run build`

Expected: PASS; bad signatures return 401, duplicate event produces one payment, approved event activates enrollment.

- [ ] **Step 7: Commit**

```bash
git add prisma app components server tests
git commit -m "feat: add recurring billing and payment webhooks"
```

### Task 6: Painel administrativo e alertas operacionais

**Files:**
- Create: `server/services/dashboard.ts`, `server/services/alerts.ts`
- Create: `app/admin/page.tsx`, `components/dashboard/metric-card.tsx`, `components/dashboard/alert-list.tsx`
- Create: `app/api/admin/dashboard/route.ts`, `tests/unit/dashboard.test.ts`

**Interfaces:**
- Consumes: students, enrollment, invoice and booking data from Tasks 3–5.
- Produces: `getDashboard(from, to, now): DashboardData` and `getOperationalAlerts(now): Alert[]`.

- [ ] **Step 1: Write failing dashboard tests**

```ts
it('returns birthday alerts for today', async () => {
  await createStudent({ birthDate: new Date('1990-08-18') });
  expect(await getOperationalAlerts(new Date('2026-08-18')))
    .toContainEqual(expect.objectContaining({ type: 'BIRTHDAY' }));
});

it('flags an active student with no booking in the current week', async () => {
  await createActiveEnrollment('s1');
  expect(await getOperationalAlerts(new Date('2026-08-18')))
    .toContainEqual(expect.objectContaining({ type: 'NO_WEEKLY_BOOKING', studentId: 's1' }));
});
```

- [ ] **Step 2: Run the failing test**

Run: `npm test -- --run tests/unit/dashboard.test.ts`

Expected: FAIL because the dashboard service does not exist.

- [ ] **Step 3: Implement dashboard queries**

Return active students, received and forecast revenue for the selected month, overdue invoice count/value, class occupancy and individual attendance rate. Return alerts for birthdays today/next seven days, invoices due within seven days, overdue invoices, zero bookings in the ISO week, and attendance below 50% in the prior four weeks.

- [ ] **Step 4: Build the admin home**

Show five metric cards and an alert list. Each alert links to the relevant student or financial filter. Do not show clinical notes on the dashboard; only a generic link to the student detail page.

- [ ] **Step 5: Run checks**

Run: `npm test -- --run tests/unit/dashboard.test.ts && npm run build`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add app components server tests
git commit -m "feat: add studio dashboard and alerts"
```

### Task 7: Portal do aluno e instalação como PWA

**Files:**
- Create: `app/aluno/page.tsx`, `app/aluno/agenda/page.tsx`, `app/aluno/financeiro/page.tsx`, `app/aluno/historico/page.tsx`
- Create: `components/student/booking-calendar.tsx`, `components/student/invoice-list.tsx`, `components/student/attendance-history.tsx`
- Create: `app/manifest.ts`, `public/icons/icon-192.png`, `public/icons/icon-512.png`, `public/sw.js`
- Create: `tests/e2e/student-portal.spec.ts`

**Interfaces:**
- Consumes: student booking and invoice endpoints from Tasks 4–5.
- Produces: responsive student portal with `/aluno`, `/aluno/agenda`, `/aluno/financeiro`, `/aluno/historico`.

- [ ] **Step 1: Write failing end-to-end journey**

```ts
test('student books an available class then sees it in history', async ({ page }) => {
  await loginAsStudent(page);
  await page.goto('/aluno/agenda');
  await page.getByRole('button', { name: 'Reservar 18:00' }).click();
  await expect(page.getByText('Reserva confirmada')).toBeVisible();
  await page.goto('/aluno/historico');
  await expect(page.getByText('18:00')).toBeVisible();
});
```

- [ ] **Step 2: Run the failing E2E test**

Run: `npm run test:e2e -- tests/e2e/student-portal.spec.ts`

Expected: FAIL because student pages and test authentication helper do not exist.

- [ ] **Step 3: Implement student portal pages**

Use a bottom navigation appropriate for mobile: `Início`, `Agenda`, `Pagamentos`, `Histórico`. The home page shows current plan, next reservation and payment status. The agenda offers only available classes and clearly labels unavailable reasons; swap/cancel controls disappear at or inside the two-hour cutoff. The payment page links only to invoices belonging to the session student.

- [ ] **Step 4: Add PWA metadata**

Create `app/manifest.ts` with Portuguese name, short name, standalone display, theme/background colors and 192/512 icons. Register `public/sw.js` only for static offline shell caching; API requests must remain network-only so availability and payment status are not stale.

- [ ] **Step 5: Run responsive and E2E checks**

Run: `npm run test:e2e -- tests/e2e/student-portal.spec.ts`

Expected: PASS at Playwright mobile viewport and desktop viewport.

- [ ] **Step 6: Commit**

```bash
git add app components public tests
git commit -m "feat: add installable student portal"
```

### Task 8: End-to-end security and release verification

**Files:**
- Create: `tests/e2e/admin-operations.spec.ts`, `tests/e2e/privacy.spec.ts`, `README.md`
- Modify: `.env.example`

**Interfaces:**
- Consumes: all user flows and environment settings from Tasks 1–7.
- Produces: reproducible local setup and verified release candidate.

- [ ] **Step 1: Write failing privacy and administrative journey tests**

```ts
test('student cannot open a clinical record by guessed URL', async ({ page }) => {
  await loginAsStudent(page);
  await page.goto('/admin/alunos/student-1');
  await expect(page.getByText('Acesso negado')).toBeVisible();
});

test('admin records attendance and sees dashboard metric update', async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto('/admin/agenda');
  await page.getByRole('button', { name: 'Marcar presença de Ana' }).click();
  await page.goto('/admin');
  await expect(page.getByTestId('active-students')).toBeVisible();
});
```

- [ ] **Step 2: Run the failing release suite**

Run: `npm run test:e2e -- tests/e2e/admin-operations.spec.ts tests/e2e/privacy.spec.ts`

Expected: FAIL until test ids and final access-denied page are implemented.

- [ ] **Step 3: Finish accessibility, error and setup documentation**

Ensure all controls have labels, forms announce validation errors and protected routes present a 403 page rather than blank content. Document exact setup: database, migration, seed, Mercado Pago sandbox credentials, local webhook forwarding and test commands. Keep credentials out of the repository.

- [ ] **Step 4: Run the complete verification suite**

Run: `npm run lint && npm test -- --run && npx prisma validate && npm run build && npm run test:e2e`

Expected: all commands exit 0.

- [ ] **Step 5: Commit**

```bash
git add README.md .env.example app tests
git commit -m "test: verify Pilates CRM MVP journeys"
```

## Self-review

### Spec coverage

- Administração, alunos, aniversário, restrições e evolução: Tasks 3 and 6.
- Plano mensal 2x/semana, agenda, vaga, troca, cancelamento, presença e faltas: Task 4.
- Pix/cartão, recorrência, status financeiro e inadimplência: Task 5.
- Portal responsivo e instalável do aluno: Task 7.
- Histórico, indicadores e alertas operacionais: Tasks 4, 6 and 7.
- Proteção de dados clínicos, auditoria, autorização e webhook assinado: Tasks 2, 3, 5 and 8.
- Testes de unidade, integração, E2E e responsividade: Tasks 1–8.

### Consistency check

The booking API uses the exact `createBooking`, `changeBooking`, `cancelBooking` and `recordAttendance` services defined in Task 4. The payment adapter and webhook processor are defined in Task 5 and only used by that task. No clinical data interface is consumed by any student route.

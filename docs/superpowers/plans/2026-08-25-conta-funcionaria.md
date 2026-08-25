# Conta de Funcionária sem acesso financeiro Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar contas de funcionária que podem operar o CRM sem visualizar ou acessar dados financeiros.

**Architecture:** O banco passa a ter o papel `EMPLOYEE`. A autenticação preserva o papel na sessão e funções de autorização separam acesso operacional de acesso financeiro. Páginas e APIs retornam somente os dados permitidos pelo papel, e a navegação é calculada a partir do papel atual.

**Tech Stack:** Next.js 15 App Router, NextAuth Credentials, Prisma/PostgreSQL, TypeScript, Vitest, Tailwind CSS.

**Spec:** `docs/superpowers/specs/2026-08-25-conta-funcionaria-design.md`

## Global Constraints

- O administrador existente mantém acesso integral e sem mudança de senha.
- `EMPLOYEE` não acessa valores, planos, pagamentos, mensalidades ou relatórios financeiros, inclusive por URLs e APIs diretas.
- A funcionária pode usar somente painel operacional, alunos básicos, turmas, agenda, chamada e remarcações.
- Operações destrutivas e matrículas continuam exclusivas de administrador.
- Não apagar ou alterar contas e dados existentes de alunos.

---

### Task 1: Papel EMPLOYEE e sessão autenticada

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/<timestamp>_add_employee_role/migration.sql`
- Modify: `lib/permissions.ts`
- Modify: `lib/auth.ts`
- Test: `tests/unit/permissions.test.ts`

**Interfaces:**
- Produces `SessionUser['role']` com `'ADMIN' | 'EMPLOYEE' | 'STUDENT'`.
- Produces `requireOperationalAccess()` que aceita `ADMIN` e `EMPLOYEE`.
- Produces `requireFinancialAccess()` que aceita somente `ADMIN`.

- [ ] **Step 1: Write the failing permission tests**

```ts
expect(requireOperationalAccess({ id: 'employee_1', role: 'EMPLOYEE' })).toMatchObject({ role: 'EMPLOYEE' });
expect(() => requireFinancialAccess({ id: 'employee_1', role: 'EMPLOYEE' })).toThrow(UnauthorizedError);
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node ./node_modules/vitest/vitest.mjs run tests/unit/permissions.test.ts`

Expected: FAIL because `EMPLOYEE`, `requireOperationalAccess`, and `requireFinancialAccess` do not exist.

- [ ] **Step 3: Add the database role and permission helpers**

```prisma
enum Role {
  ADMIN
  EMPLOYEE
  STUDENT
}
```

Add `fullName String?` to `model User` so employee names can be displayed in `Equipe` without changing any existing user.

```ts
export function requireOperationalAccess(user: SessionUser | null) {
  if (!user || !['ADMIN', 'EMPLOYEE'].includes(user.role)) throw new UnauthorizedError();
  return user;
}
export function requireFinancialAccess(user: SessionUser | null) {
  if (!user || user.role !== 'ADMIN') throw new UnauthorizedError();
  return user;
}
```

Update `TokenWithRole`, `getSessionUser`, and add exported auth wrappers with the same names.

- [ ] **Step 4: Generate and apply the migration locally**

Run: `pnpm prisma migrate dev --name add_employee_role`

Expected: Prisma creates the migration with `ALTER TYPE "Role" ADD VALUE 'EMPLOYEE'`.

- [ ] **Step 5: Run tests**

Run: `node ./node_modules/vitest/vitest.mjs run tests/unit/permissions.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add prisma lib/permissions.ts lib/auth.ts tests/unit/permissions.test.ts
git commit -m "feat: adicionar papel de funcionária"
```

### Task 2: Criar contas de funcionária pelo administrador

**Files:**
- Create: `server/services/employees.ts`
- Create: `app/api/admin/employees/route.ts`
- Create: `components/admin/employee-form.tsx`
- Create: `app/admin/equipe/page.tsx`
- Modify: `components/navigation/navigation-links.ts`
- Test: `tests/integration/employee-route.test.ts`
- Test: `tests/unit/navigation-links.test.ts`

**Interfaces:**
- Consumes `requireFinancialAccess()` da Task 1.
- Produces `createEmployee(input, actorId)` com entrada `{ fullName, email, password }`.
- Produces `POST /api/admin/employees` exclusivo para administrador.

- [ ] **Step 1: Write the failing route test**

```ts
mocks.requireFinancialAccess.mockRejectedValue(new UnauthorizedError());
await expect(POST(new Request('http://localhost', { method: 'POST' })))
  .resolves.toMatchObject({ status: 403 });
expect(mocks.createEmployee).not.toHaveBeenCalled();
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node ./node_modules/vitest/vitest.mjs run tests/integration/employee-route.test.ts`

Expected: FAIL because the employee route does not exist.

- [ ] **Step 3: Implement employee creation**

```ts
const input = z.object({ fullName: z.string().trim().min(2), email: z.string().email(), password: z.string().min(8) });
const user = await prisma.user.create({
  data: { fullName: data.fullName, email: data.email.toLowerCase(), passwordHash: await bcrypt.hash(data.password, 12), role: 'EMPLOYEE' },
});
await writeAuditLog({ actorId, action: 'EMPLOYEE_CREATED', entity: 'User', entityId: user.id, reason: data.fullName });
```

Create `/admin/equipe` with a form for nome, e-mail, senha and a list of employee e-mails. Add `Equipe` to administrator navigation only.

- [ ] **Step 4: Run tests**

Run: `node ./node_modules/vitest/vitest.mjs run tests/integration/employee-route.test.ts tests/unit/navigation-links.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add server/services/employees.ts app/api/admin/employees components/admin/employee-form.tsx app/admin/equipe components/navigation/navigation-links.ts tests
git commit -m "feat: permitir criar contas de funcionária"
```

### Task 3: Separar navegação e páginas operacionais

**Files:**
- Modify: `app/admin/layout.tsx`
- Modify: `components/navigation/admin-navbar.tsx`
- Modify: `components/navigation/navigation-links.ts`
- Modify: `app/admin/page.tsx`
- Modify: `components/dashboard/dashboard-cards.tsx`
- Modify: `app/api/admin/dashboard/route.ts`
- Test: `tests/unit/employee-navigation.test.ts`
- Test: `tests/integration/employee-dashboard-route.test.ts`

**Interfaces:**
- Consumes `requireOperationalAccess()` and `requireFinancialAccess()` from Task 1.
- Produces `adminNavigationLinks` and `employeeNavigationLinks`.
- Produces dashboard response with `financial: null` for `EMPLOYEE`.

- [ ] **Step 1: Write failing navigation and dashboard tests**

```ts
expect(employeeNavigationLinks.map((item) => item.href)).toEqual([
  '/admin', '/admin/alunos', '/admin/turmas', '/admin/agenda', '/admin/chamada', '/admin/remarcacoes',
]);
expect(await GET(new Request('http://localhost'))).resolves.toMatchObject({ status: 200 });
expect(mocks.getDashboard).toHaveBeenCalledWith(expect.any(Date), { includeFinancial: false });
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node ./node_modules/vitest/vitest.mjs run tests/unit/employee-navigation.test.ts tests/integration/employee-dashboard-route.test.ts`

Expected: FAIL because employee navigation and dashboard filtering do not exist.

- [ ] **Step 3: Implement operational layout and filtered dashboard**

```ts
const user = await getSessionUser();
if (!user || !['ADMIN', 'EMPLOYEE'].includes(user.role)) redirect('/login');
```

Have `AdminNavbar` receive `role` and render the matching link list. In `getDashboard`, accept `{ includeFinancial: boolean }`; omit `receivedCents` and `monthlyForecasts` when false. Render only operational cards when no financial payload exists.

- [ ] **Step 4: Run tests**

Run: `node ./node_modules/vitest/vitest.mjs run tests/unit/employee-navigation.test.ts tests/integration/employee-dashboard-route.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/admin/layout.tsx app/admin/page.tsx components/navigation components/dashboard app/api/admin/dashboard server/services/dashboard.ts tests
git commit -m "feat: limitar painel da funcionária a dados operacionais"
```

### Task 4: Bloquear dados e APIs financeiras

**Files:**
- Modify: `app/admin/financeiro/page.tsx`
- Modify: `app/admin/planos/page.tsx`
- Modify: `app/admin/relatorios/page.tsx`
- Modify: `app/api/admin/manual-payments/route.ts`
- Modify: `app/api/admin/invoices/route.ts`
- Modify: `app/api/admin/plans/route.ts`
- Modify: `app/api/admin/enrollments/route.ts`
- Modify: `app/admin/alunos/[studentId]/page.tsx`
- Modify: `app/admin/alunos/page.tsx`
- Test: `tests/integration/financial-permissions.test.ts`
- Test: `tests/unit/employee-student-view.test.ts`

**Interfaces:**
- Consumes `requireFinancialAccess()` for financial pages/routes.
- Consumes `requireOperationalAccess()` for student pages.
- Produces 403 JSON response `{ error: 'Acesso restrito ao administrador.' }` to an employee calling a financial API.

- [ ] **Step 1: Write failing financial access tests**

```ts
mocks.requireFinancialAccess.mockRejectedValue(new UnauthorizedError('Acesso restrito ao administrador.'));
await expect(POST(paymentRequest)).resolves.toMatchObject({ status: 403 });
await expect(GET(planRequest)).resolves.toMatchObject({ status: 403 });
```

Write a server-page rendering test that verifies employee student data excludes `monthlyPriceCents`, invoices, and manual payments.

- [ ] **Step 2: Run tests to verify they fail**

Run: `node ./node_modules/vitest/vitest.mjs run tests/integration/financial-permissions.test.ts tests/unit/employee-student-view.test.ts`

Expected: FAIL because financial routes only require generic administrator access and student queries include prices.

- [ ] **Step 3: Apply financial permission checks and data minimization**

```ts
export async function POST(request: Request) {
  try {
    const admin = await requireFinancialAccess();
    return NextResponse.json(await recordManualPayment(await request.json(), admin.id), { status: 201 });
  } catch (error) {
    if (error instanceof UnauthorizedError) return NextResponse.json({ error: 'Acesso restrito ao administrador.' }, { status: 403 });
    throw error;
  }
}
```

Every finance page calls `requireFinancialAccess()` before querying. Employee student list/detail queries select only `id`, `fullName`, `phone`, `birthDate`, scheduling, health, and attendance fields; they do not select enrollment plan price, invoices, manual payments, or payment status. Hide enrollment and destructive controls for employees.

- [ ] **Step 4: Run tests**

Run: `node ./node_modules/vitest/vitest.mjs run tests/integration/financial-permissions.test.ts tests/unit/employee-student-view.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/admin app/api/admin components/students tests
git commit -m "feat: proteger dados financeiros da funcionária"
```

### Task 5: Permitir somente operações operacionais à funcionária

**Files:**
- Modify: `app/api/admin/students/route.ts`
- Modify: `app/api/admin/students/[studentId]/route.ts`
- Modify: `app/api/admin/class-slots/route.ts`
- Modify: `app/api/admin/class-slots/[classSlotId]/day-pair/route.ts`
- Modify: `app/api/admin/agenda/route.ts`
- Modify: `app/api/admin/attendance/route.ts`
- Modify: `app/api/admin/remarcacoes/[messageId]/route.ts`
- Test: `tests/integration/employee-operational-routes.test.ts`

**Interfaces:**
- Consumes `requireOperationalAccess()` from Task 1.
- Employee is allowed only safe operational mutations: student basic updates, class scheduling, attendance, and deleting a remarcação notification.
- Existing permanent-delete, archive, plan delete, finance, enrollment, and employee management routes stay `ADMIN` only.

- [ ] **Step 1: Write failing operational route tests**

```ts
mocks.requireOperationalAccess.mockResolvedValue({ id: 'employee_1', role: 'EMPLOYEE' });
await expect(PATCH(studentRequest, studentParams)).resolves.toMatchObject({ status: 200 });
await expect(DELETE(studentDeleteRequest, studentParams)).resolves.toMatchObject({ status: 403 });
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node ./node_modules/vitest/vitest.mjs run tests/integration/employee-operational-routes.test.ts`

Expected: FAIL because the operational routes use `requireAdmin()`.

- [ ] **Step 3: Replace only safe route guards**

```ts
const operator = await requireOperationalAccess();
return NextResponse.json(await updateStudent(studentId, await request.json(), operator.id));
```

Do not change the guards in `/delete`, `/archive`, `/plans`, `/manual-payments`, `/invoices`, `/enrollments`, `/employees`, or `/class-slots/[classSlotId]` DELETE.

- [ ] **Step 4: Run tests**

Run: `node ./node_modules/vitest/vitest.mjs run tests/integration/employee-operational-routes.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/api/admin tests/integration/employee-operational-routes.test.ts
git commit -m "feat: liberar rotina operacional para funcionária"
```

### Task 6: Verificação e deploy

**Files:**
- Modify: `.env.example`
- Test: all existing tests

**Interfaces:**
- No new production secret is required; the role is stored in the database.
- Vercel must have a valid `DATABASE_URL` to run the Prisma migration.

- [ ] **Step 1: Update environment documentation**

Add a comment to `.env.example` explaining that employee accounts are created in `Administração > Equipe`; no employee password belongs in environment variables.

- [ ] **Step 2: Run full verification**

Run: `node ./node_modules/vitest/vitest.mjs run`

Expected: all test files pass.

Run: `pnpm prisma generate && pnpm run build`

Expected: Next.js production build succeeds.

- [ ] **Step 3: Deploy schema migration**

Run: `pnpm prisma migrate deploy`

Expected: migration `add_employee_role` is applied to Supabase.

- [ ] **Step 4: Commit and push**

```bash
git add .env.example docs/superpowers/specs/2026-08-25-conta-funcionaria-design.md docs/superpowers/plans/2026-08-25-conta-funcionaria.md
git commit -m "docs: documentar acesso de funcionária"
git push origin feat/crm-pilates-mvp
```

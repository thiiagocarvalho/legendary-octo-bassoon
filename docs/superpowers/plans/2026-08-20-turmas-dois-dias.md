# Turmas com Dois Dias Fixos Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permitir que cada turma use exclusivamente Segunda/Quarta ou Terça/Quinta, mantendo o mesmo horário, duração e vagas nos dois dias.

**Architecture:** `ClassSlot` preserva `weekday` como primeiro dia e recebe `secondWeekday` opcional para compatibilidade com turmas antigas. Novas turmas usam uma combinação fechada; o materializador cria ocorrências para ambos os dias e a tela permite completar turmas antigas sem alterar seus demais campos.

**Tech Stack:** Next.js App Router, TypeScript, Prisma/PostgreSQL, Zod, Vitest, React.

**Spec:** `docs/superpowers/specs/2026-08-20-turmas-dois-dias-design.md`

## Global Constraints

- Permitir somente Segunda/Quarta (`1`/`3`) ou Terça/Quinta (`2`/`4`).
- Horário, duração e vagas permanecem únicos e compartilhados pelos dois dias.
- Nunca inferir ou modificar automaticamente o segundo dia das turmas existentes.
- Proteger rotas administrativas com `requireAdmin`.

---

### Task 1: Modelo, validação e materialização de dois dias

**Files:**
- Create: `prisma/migrations/20260820220000_add_second_weekday_to_class_slot/migration.sql`, `tests/unit/two-day-schedule.test.ts`
- Modify: `prisma/schema.prisma`, `lib/validation/schedule.ts`, `server/services/occurrences.ts`

**Interfaces:**
- Produces `ClassSlot.secondWeekday: number | null`.
- Produces `classSlotInput` que aceita `dayPair: 'MON_WED' | 'TUE_THU'` e converte para `weekday`/`secondWeekday`.
- Updates `materializeOccurrences(classSlotId, from?, weeks?)` to create occurrences for both stored weekdays.

- [ ] **Step 1: Write the failing validation test**

```ts
import { classSlotInput } from '../../lib/validation/schedule';
expect(classSlotInput.safeParse({ dayPair: 'MON_WED', startsTime: '08:00', duration: 60, capacity: 4 }).data)
  .toMatchObject({ weekday: 1, secondWeekday: 3 });
expect(classSlotInput.safeParse({ dayPair: 'FRI_SAT', startsTime: '08:00', duration: 60, capacity: 4 }).success).toBe(false);
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node node_modules/vitest/vitest.mjs run tests/unit/two-day-schedule.test.ts`

Expected: FAIL because `dayPair` is not accepted or transformed.

- [ ] **Step 3: Add migration, schema and Zod transformation**

```sql
ALTER TABLE "ClassSlot" ADD COLUMN "secondWeekday" INTEGER;
```

```ts
const dayPairs = { MON_WED: { weekday: 1, secondWeekday: 3 }, TUE_THU: { weekday: 2, secondWeekday: 4 } } as const;
export const classSlotInput = z.object({ dayPair: z.enum(['MON_WED', 'TUE_THU']), startsTime: timeInput, duration: durationInput, capacity: capacityInput })
  .transform(({ dayPair, ...data }) => ({ ...data, ...dayPairs[dayPair] }));
```

Add `secondWeekday Int?` to `ClassSlot`. Refactor `materializeOccurrences` to build one weekly row sequence for `weekday` and another only when `secondWeekday` exists, passing the combined rows to `createMany({ skipDuplicates: true })`.

- [ ] **Step 4: Run unit test and Prisma generation**

Run: `node node_modules/vitest/vitest.mjs run tests/unit/two-day-schedule.test.ts && node node_modules/prisma/build/index.js generate`

Expected: PASS and generated client includes `secondWeekday`.

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/20260820220000_add_second_weekday_to_class_slot/migration.sql lib/validation/schedule.ts server/services/occurrences.ts tests/unit/two-day-schedule.test.ts
git commit -m "feat: support paired class weekdays"
```

### Task 2: Rotas administrativas e conclusão de turmas existentes

**Files:**
- Create: `app/api/admin/class-slots/[classSlotId]/day-pair/route.ts`, `tests/integration/class-slot-day-pair-route.test.ts`
- Modify: `app/api/admin/class-slots/route.ts`

**Interfaces:**
- `POST /api/admin/class-slots` consumes transformed `classSlotInput` and materializes both days.
- `PATCH /api/admin/class-slots/:classSlotId/day-pair` accepts `{ dayPair: 'MON_WED' | 'TUE_THU' }`, only when the first day matches the stored `weekday`, stores `secondWeekday` and returns the new occurrences.

- [ ] **Step 1: Write the failing route authorization test**

```ts
mocks.requireAdmin.mockRejectedValue(new UnauthorizedError('Sem permissão.'));
await expect(PATCH(request, { params: Promise.resolve({ classSlotId: 'slot_1' }) })).resolves.toMatchObject({ status: 403 });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node node_modules/vitest/vitest.mjs run tests/integration/class-slot-day-pair-route.test.ts`

Expected: FAIL because the day-pair route does not exist.

- [ ] **Step 3: Implement paired-day endpoint**

```ts
const pair = dayPairInput.parse(await request.json());
const slot = await prisma.classSlot.findUniqueOrThrow({ where: { id: classSlotId } });
if (slot.weekday !== pair.weekday) return NextResponse.json({ error: 'Escolha a combinação compatível com o primeiro dia da turma.' }, { status: 400 });
await prisma.classSlot.update({ where: { id: classSlotId }, data: { secondWeekday: pair.secondWeekday } });
return NextResponse.json(await materializeOccurrences(classSlotId));
```

- [ ] **Step 4: Run route test**

Run: `node node_modules/vitest/vitest.mjs run tests/integration/class-slot-day-pair-route.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/api/admin/class-slots/route.ts 'app/api/admin/class-slots/[classSlotId]/day-pair/route.ts' tests/integration/class-slot-day-pair-route.test.ts
git commit -m "feat: complete legacy class day pairs"
```

### Task 3: Interface de turmas e verificação final

**Files:**
- Create: `components/schedule/complete-day-pair-form.tsx`
- Modify: `components/schedule/class-slot-form.tsx`, `app/admin/turmas/page.tsx`, `lib/schedule-display.ts`, `tests/unit/schedule-display.test.ts`

**Interfaces:**
- New form submits `dayPair` using two radio buttons labelled `Segunda e Quarta` and `Terça e Quinta`.
- `weekdayPairLabel(weekday, secondWeekday)` returns the display text for complete or incomplete slots.
- Legacy slots with null `secondWeekday` render `CompleteSecondDayForm` with only the compatible pair selectable.

- [ ] **Step 1: Write the failing display test**

```ts
expect(weekdayPairLabel(1, 3)).toBe('Segunda e Quarta');
expect(weekdayPairLabel(2, 4)).toBe('Terça e Quinta');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node node_modules/vitest/vitest.mjs run tests/unit/schedule-display.test.ts`

Expected: FAIL because `weekdayPairLabel` is not exported.

- [ ] **Step 3: Implement UI**

Use two labelled radio inputs for new classes, preserving the existing inputs for `startsTime`, `duration` and `capacity`. In the table, replace the single weekday cell with `weekdayPairLabel(item.weekday, item.secondWeekday)`. Render `CompleteSecondDayForm` only where `secondWeekday` is null; it sends a PATCH request to the paired-day endpoint and refreshes the route on success.

- [ ] **Step 4: Run full verification**

Run: `node node_modules/vitest/vitest.mjs run && node node_modules/next/dist/bin/next build`

Expected: all tests pass and Next.js production build succeeds.

- [ ] **Step 5: Apply migration and commit**

Run: `node node_modules/prisma/build/index.js migrate deploy`

```bash
git add components/schedule/class-slot-form.tsx components/schedule/complete-day-pair-form.tsx app/admin/turmas/page.tsx lib/schedule-display.ts tests/unit/schedule-display.test.ts
git commit -m "feat: manage classes in fixed day pairs"
```

# Carpool Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign carpool system — add configurable driver refund per passenger, cutoff-based assignment cron, role confirmation email, and enhanced success email (SYW-034).

**Architecture:** Events get two new columns (`driver_refund_per_passenger`, `carpool_cutoff_days`). Carpool assignment runs via daily cron at cutoff. Role confirmation emails go out post-assignment. Success email (SYW-034) enhanced with full registration details. Frontend transport options relabeled to 自行前往/需要被載/可出車.

**Tech Stack:** Next.js 16 (App Router), Supabase (PostgreSQL), Resend (email), Vitest, Zod, pnpm

---

## File Map

| File                                                       | Action | Responsibility                                                  |
| ---------------------------------------------------------- | ------ | --------------------------------------------------------------- |
| `lib/supabase/migrations/002-add-carpool-event-fields.sql` | Create | Migration: add columns to events                                |
| `lib/types/database.ts`                                    | Modify | Add new fields to EventRow                                      |
| `lib/services/carpool.ts`                                  | Modify | Change refund calculation                                       |
| `lib/services/__tests__/carpool.test.ts`                   | Modify | Update tests for new refund logic                               |
| `app/api/cron/assign-carpool/route.ts`                     | Create | Daily cron: find events at cutoff, run assignment + send emails |
| `lib/email/send-carpool-role-email.ts`                     | Create | Driver/passenger role confirmation email template               |
| `lib/email/send-registration-success-email.ts`             | Modify | Enhance with full event + registration details                  |
| `lib/services/registrations.ts`                            | Modify | Pass more data to success email                                 |
| `components/pages/event-detail/PackageOptions.tsx`         | Modify | Three transport options, seat_count input                       |
| `components/pages/event-detail/packageOptions.types.ts`    | Modify | Update PackageSelection type                                    |
| `messages/en.json` + `messages/zh-TW.json`                 | Modify | Add/update i18n keys                                            |

---

### Task 1: DB Migration + Type Update

**Files:**

- Create: `lib/supabase/migrations/002-add-carpool-event-fields.sql`
- Modify: `lib/types/database.ts`

- [ ] **Step 1: Write migration SQL**

```sql
-- 002-add-carpool-event-fields.sql
ALTER TABLE events
  ADD COLUMN driver_refund_per_passenger integer NOT NULL DEFAULT 0,
  ADD COLUMN carpool_cutoff_days integer NOT NULL DEFAULT 3;

ALTER TABLE events
  ADD CONSTRAINT events_driver_refund_check CHECK (driver_refund_per_passenger >= 0),
  ADD CONSTRAINT events_cutoff_days_check CHECK (carpool_cutoff_days >= 1);
```

- [ ] **Step 2: Run migration on linked Supabase**

Run: `pnpm exec supabase db push`
Expected: Migration applied successfully.

- [ ] **Step 3: Update EventRow type**

In `lib/types/database.ts`, add to `EventRow`:

```typescript
export interface EventRow {
  // ... existing fields ...
  carpool_surcharge: number;
  driver_refund_per_passenger: number;
  carpool_cutoff_days: number;
  payment_days: number;
  // ... rest ...
}
```

- [ ] **Step 4: Update test fixtures**

In `lib/services/__tests__/carpool.test.ts`, update `baseEvent`:

```typescript
const baseEvent: EventRow = {
  id: "evt-1",
  type: "trip",
  location: "宜蘭",
  title: "Test event",
  start_date: "2026-05-01",
  end_date: "2026-05-02",
  base_price: 1000,
  carpool_surcharge: 100,
  driver_refund_per_passenger: 200,
  carpool_cutoff_days: 3,
  payment_days: 7,
  min_participants: 4,
  status: "open",
  first_created_at: "2026-04-01T00:00:00Z",
};
```

- [ ] **Step 5: Run type check**

Run: `pnpm tsc --noEmit`
Expected: No errors (all EventRow usages updated).

- [ ] **Step 6: Commit**

```bash
git add lib/supabase/migrations/002-add-carpool-event-fields.sql lib/types/database.ts lib/services/__tests__/carpool.test.ts
git commit -m "chore(db): add driver_refund_per_passenger and carpool_cutoff_days to events"
```

---

### Task 2: Carpool Refund Calculation Change

**Files:**

- Modify: `lib/services/carpool.ts`
- Modify: `lib/services/__tests__/carpool.test.ts`

- [ ] **Step 1: Write failing tests for new refund logic**

In `lib/services/__tests__/carpool.test.ts`, update the test "一位司機帶滿三位乘客，分成同一組":

```typescript
it("一位司機帶滿三位乘客，退還 = driver_refund_per_passenger × 載客數", () => {
  const driver = makeReg({
    id: "drv-1",
    carpool_role: "driver",
    seat_count: 3,
  });
  const passengers = [
    makeReg({ id: "p-1" }),
    makeReg({ id: "p-2" }),
    makeReg({ id: "p-3" }),
  ];

  const result = buildAssignments("evt-1", baseEvent, [driver, ...passengers]);

  expect(result).toHaveLength(4);
  expect(result[0]).toMatchObject({
    registration_id: "drv-1",
    final_role: "driver",
    car_group: 1,
    refund_amount: 600, // 200 × 3 passengers
  });
});
```

Update "同地點多位司機，最大座位的當 lead，其餘降為 passenger":

```typescript
it("同地點多位司機，最大座位的當 lead，其餘降為 passenger", () => {
  const drvA = makeReg({
    id: "drv-A",
    carpool_role: "driver",
    seat_count: 4,
  });
  const drvB = makeReg({
    id: "drv-B",
    carpool_role: "driver",
    seat_count: 2,
  });

  const result = buildAssignments("evt-1", baseEvent, [drvA, drvB]);

  expect(result).toHaveLength(2);
  expect(result[0]).toMatchObject({
    registration_id: "drv-A",
    final_role: "driver",
    car_group: 1,
    refund_amount: 200, // 200 × 1 passenger (drvB demoted)
  });
  expect(result[1]).toMatchObject({
    registration_id: "drv-B",
    final_role: "passenger",
    car_group: 1,
    refund_amount: 0,
  });
});
```

Update "司機 seat_count 為 null 時 fallback 走 3 座":

```typescript
it("司機 seat_count 為 null 時 fallback 走 3 座，退還 = per_passenger × 實載數", () => {
  const driver = makeReg({
    id: "drv-1",
    carpool_role: "driver",
    seat_count: null,
  });
  const passengers = [
    makeReg({ id: "p-1" }),
    makeReg({ id: "p-2" }),
    makeReg({ id: "p-3" }),
    makeReg({ id: "p-4" }),
  ];

  const result = buildAssignments("evt-1", baseEvent, [driver, ...passengers]);

  expect(result).toHaveLength(5);
  expect(result[0]).toMatchObject({
    final_role: "driver",
    refund_amount: 600, // 200 × 3 passengers in car (seat_count fallback 3)
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm vitest run lib/services/__tests__/carpool.test.ts`
Expected: FAIL — refund_amount assertions mismatch (old formula gives different values).

- [ ] **Step 3: Update makeDriver to use new refund formula**

In `lib/services/carpool.ts`, change `makeDriver` signature and `buildAssignments` to pass actual passenger count:

```typescript
function makeDriver(
  eventId: string,
  carGroup: number,
  location: string,
  driver: RegistrationRow,
  actualPassengerCount: number,
  event: EventRow
): CarpoolAssignment {
  return {
    event_id: eventId,
    car_group: carGroup,
    pickup_location: location,
    registration_id: driver.id,
    final_role: "driver",
    refund_amount: actualPassengerCount * event.driver_refund_per_passenger,
  };
}
```

In `buildAssignments`, update the call to `makeDriver`:

```typescript
// Replace:
// assignments.push(makeDriver(eventId, carGroup, location, lead, seatCount, event));
// With:
assignments.push(
  makeDriver(eventId, carGroup, location, lead, groupPassengers.length, event)
);
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm vitest run lib/services/__tests__/carpool.test.ts`
Expected: All PASS.

- [ ] **Step 5: Run full test suite**

Run: `pnpm vitest run`
Expected: All pass.

- [ ] **Step 6: Commit**

```bash
git add lib/services/carpool.ts lib/services/__tests__/carpool.test.ts
git commit -m "feat(carpool): change refund to driver_refund_per_passenger × actual passenger count"
```

---

### Task 3: Assign-Carpool Cron Endpoint

**Files:**

- Create: `app/api/cron/assign-carpool/route.ts`

- [ ] **Step 1: Create the cron endpoint**

```typescript
import { handleError } from "@/lib/api/handle-error";
import { apiOk } from "@/lib/api-response";
import { UnauthorizedError } from "@/lib/errors/domain";
import { assignCarpool } from "@/lib/services/carpool";
import { getSupabase } from "@/lib/supabase/client";
import { sendCarpoolRoleEmail } from "@/lib/email/send-carpool-role-email";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      throw new UnauthorizedError();
    }

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    // Find events where start_date - carpool_cutoff_days = today
    const { data: events, error } = await getSupabase()
      .from("events")
      .select(
        "id, title, start_date, carpool_cutoff_days, driver_refund_per_passenger"
      )
      .eq("status", "open");

    if (error) {
      return apiOk({ processed: 0, error: error.message });
    }

    const eventsAtCutoff = (events ?? []).filter((event) => {
      const startDate = new Date(event.start_date + "T00:00:00");
      const cutoffDate = new Date(startDate);
      cutoffDate.setDate(cutoffDate.getDate() - event.carpool_cutoff_days);
      const cutoffStr = `${cutoffDate.getFullYear()}-${String(cutoffDate.getMonth() + 1).padStart(2, "0")}-${String(cutoffDate.getDate()).padStart(2, "0")}`;
      return cutoffStr === todayStr;
    });

    const results = [];
    for (const event of eventsAtCutoff) {
      const assignments = await assignCarpool(event.id);

      if (assignments.length > 0) {
        // Load registration details for email
        const regIds = assignments.map((a) => a.registration_id);
        const { data: registrations } = await getSupabase()
          .from("registrations")
          .select("id, name, email, phone, pickup_location")
          .in("id", regIds);

        if (registrations) {
          for (const assignment of assignments) {
            const reg = registrations.find(
              (r) => r.id === assignment.registration_id
            );
            if (!reg) continue;

            await sendCarpoolRoleEmail({
              to: reg.email,
              customerName: reg.name,
              eventTitle: event.title,
              eventStartDate: event.start_date,
              role: assignment.final_role as "driver" | "passenger",
              pickupLocation: assignment.pickup_location,
              refundAmount: assignment.refund_amount,
              carGroup: assignment.car_group,
            }).catch((err) =>
              console.error(
                `[cron] carpool role email failed for ${reg.id}:`,
                err
              )
            );
          }
        }
      }

      results.push({ eventId: event.id, assignments: assignments.length });
    }

    return apiOk({ processed: eventsAtCutoff.length, results });
  } catch (err) {
    return handleError(err);
  }
}
```

- [ ] **Step 2: Run type check**

Run: `pnpm tsc --noEmit`
Expected: Will fail — `sendCarpoolRoleEmail` doesn't exist yet. This is expected; Task 4 creates it.

- [ ] **Step 3: Commit (with type error acknowledged — resolved by Task 4)**

```bash
git add app/api/cron/assign-carpool/route.ts
git commit -m "feat(cron): add assign-carpool endpoint for cutoff-based assignment"
```

---

### Task 4: Carpool Role Email Template

**Files:**

- Create: `lib/email/send-carpool-role-email.ts`

- [ ] **Step 1: Create the email template**

```typescript
import { getResend } from "./client";
import { escapeHtml } from "./escape";
import { getEnv } from "@/lib/env";

interface SendCarpoolRoleEmailParams {
  to: string;
  customerName: string;
  eventTitle: string;
  eventStartDate: string;
  role: "driver" | "passenger";
  pickupLocation: string;
  refundAmount: number;
  carGroup: number;
}

export async function sendCarpoolRoleEmail(params: SendCarpoolRoleEmailParams) {
  const safeName = escapeHtml(params.customerName);
  const safeTitle = escapeHtml(params.eventTitle);
  const safeLocation = escapeHtml(params.pickupLocation);
  const formattedDate = new Date(params.eventStartDate).toLocaleDateString(
    "zh-TW",
    { year: "numeric", month: "long", day: "numeric" }
  );

  const isDriver = params.role === "driver";
  const roleLabel = isDriver ? "車手" : "乘客";
  const refundLine = isDriver
    ? `<tr><td style="color: #9eb3c2; font-size: 12px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; padding-bottom: 4px;">退還金額</td></tr><tr><td style="color: #4a7c59; font-size: 16px; font-weight: 700; line-height: 1.5; padding-bottom: 20px;">NT$ ${params.refundAmount.toLocaleString("zh-TW")}</td></tr>`
    : "";

  const driverNote = isDriver
    ? "感謝你願意擔任車手！活動結束後我們將退還上述金額。"
    : "活動方已為你安排交通，届時請於集合地點等候車手。";

  const html = `<!DOCTYPE html>
<html lang="zh-Hant">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>共乘角色確認 — ${safeTitle}</title>
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    body { margin: 0; padding: 0; width: 100% !important; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans TC', sans-serif;">

  <div style="display: none; max-height: 0; overflow: hidden;">
    ${safeName}，你在 ${safeTitle} 的共乘角色已確認為${roleLabel}。
  </div>

  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f4f6f5;">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="560" style="max-width: 560px; width: 100%;">

          <!-- Header -->
          <tr>
            <td style="background-color: #d4a373; border-radius: 12px 12px 0 0; padding: 24px 32px; text-align: center;">
              <td style="color: #ffffff; font-size: 20px; font-weight: 700; letter-spacing: 1px; text-align: center;">
                SEE YOU WILD
              </td>
            </td>
          </tr>

          <!-- Main -->
          <tr>
            <td style="background-color: #ffffff; padding: 40px 32px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr><td style="color: #2d3a40; font-size: 22px; font-weight: 700; line-height: 1.4; padding-bottom: 8px;">Hi ${safeName}</td></tr>
                <tr><td style="color: #2d3a40; font-size: 15px; line-height: 1.7; padding-bottom: 28px;">你的共乘角色已確認，以下是你的交通安排資訊。</td></tr>
              </table>

              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f4f6f5; border-radius: 8px;">
                <tr>
                  <td style="padding: 24px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr><td style="color: #9eb3c2; font-size: 12px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; padding-bottom: 4px;">活動</td></tr>
                      <tr><td style="color: #2d3a40; font-size: 16px; font-weight: 600; line-height: 1.5; padding-bottom: 20px;">${safeTitle}</td></tr>
                      <tr><td style="color: #9eb3c2; font-size: 12px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; padding-bottom: 4px;">活動日期</td></tr>
                      <tr><td style="color: #2d3a40; font-size: 16px; font-weight: 600; line-height: 1.5; padding-bottom: 20px;">${formattedDate}</td></tr>
                      <tr><td style="color: #9eb3c2; font-size: 12px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; padding-bottom: 4px;">你的角色</td></tr>
                      <tr><td style="color: #d4a373; font-size: 20px; font-weight: 700; line-height: 1.5; padding-bottom: 20px;">${roleLabel}</td></tr>
                      <tr><td style="color: #9eb3c2; font-size: 12px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; padding-bottom: 4px;">集合地點</td></tr>
                      <tr><td style="color: #2d3a40; font-size: 16px; font-weight: 600; line-height: 1.5; padding-bottom: 20px;">${safeLocation}</td></tr>
                      ${refundLine}
                    </table>
                  </td>
                </tr>
              </table>

              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr><td style="padding-top: 28px;"></td></tr>
                <tr><td style="color: #2d3a40; font-size: 15px; line-height: 1.7; text-align: center;">${driverNote}</td></tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f4f6f5; border-radius: 0 0 12px 12px; padding: 24px 32px; text-align: center;">
              <td style="color: #9eb3c2; font-size: 12px; line-height: 1.7;">
                有任何問題歡迎直接回覆此信。<br>&copy; See You Wild
              </td>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;

  await getResend().emails.send({
    from: getEnv().RESEND_FROM,
    to: params.to,
    subject: `共乘角色確認：你是${roleLabel}！— ${safeTitle}`,
    html,
  });
}
```

- [ ] **Step 2: Run type check**

Run: `pnpm tsc --noEmit`
Expected: PASS (Task 3 import now resolves).

- [ ] **Step 3: Commit**

```bash
git add lib/email/send-carpool-role-email.ts
git commit -m "feat(email): add carpool role confirmation email template"
```

---

### Task 5: Enhance Registration Success Email (SYW-034)

**Files:**

- Modify: `lib/email/send-registration-success-email.ts`
- Modify: `lib/services/registrations.ts` (expand data passed to email)

- [ ] **Step 1: Update SendRegistrationSuccessEmailParams interface**

```typescript
interface SendRegistrationSuccessEmailParams {
  to: string;
  customerName: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  amountDue: number;
  transport: string;
  dietary: string;
  wantsRental: boolean;
}
```

- [ ] **Step 2: Rewrite the email HTML template**

Rewrite the template in `send-registration-success-email.ts` with sections in this order:

1. 感謝開頭 ("Hi {name}, 你的付款已確認，報名正式完成！")
2. 活動項目 (eventTitle)
3. 活動日期 (formatted eventDate)
4. 活動地點 (eventLocation)
5. 報名者姓名
6. 已付金額 (amountDue formatted)
7. 報名資料摘要 (transport label, dietary, rental)
8. 集合地點與注意事項 (placeholder: "活動詳細集合資訊將於活動前另行通知")
9. LINE 加好友連結 (placeholder: `https://line.me/ti/p/PLACEHOLDER`)

Use the same email structure/styling as existing templates (brand bar, card, footer).

- [ ] **Step 3: Update reviewPayment in registrations.ts to pass more data**

In `lib/services/registrations.ts`, in the `reviewPayment` function, expand the select query and email call:

```typescript
const { data: registration, error: regError } = await getSupabase()
  .from("registrations")
  .select(
    "id, name, email, event_id, status, amount_due, transport, dietary, wants_rental"
  )
  .eq("id", input.registrationId)
  .single();
```

And update the success email call:

```typescript
await sendRegistrationSuccessEmail({
  to: registration.email,
  customerName: registration.name,
  eventTitle: event.title,
  eventDate: event.start_date,
  eventLocation: event.location,
  amountDue: registration.amount_due,
  transport: registration.transport,
  dietary: registration.dietary,
  wantsRental: registration.wants_rental,
}).catch((err) =>
  console.error("[notifier] registration success email failed", err)
);
```

Expand event select to include needed fields:

```typescript
const { data: event, error: eventError } = await getSupabase()
  .from("events")
  .select("title, start_date, location")
  .eq("id", registration.event_id)
  .single();
```

- [ ] **Step 4: Run type check + tests**

Run: `pnpm tsc --noEmit && pnpm vitest run`
Expected: All pass.

- [ ] **Step 5: Commit**

```bash
git add lib/email/send-registration-success-email.ts lib/services/registrations.ts
git commit -m "feat(email): enhance registration success email with full event details (SYW-034)"
```

---

### Task 6: Frontend Transport Options Redesign

**Files:**

- Modify: `components/pages/event-detail/PackageOptions.tsx`
- Modify: `components/pages/event-detail/packageOptions.types.ts`
- Modify: `messages/en.json`, `messages/zh-TW.json` (i18n keys)

- [ ] **Step 1: Update PackageSelection type**

```typescript
export interface PackageSelection {
  selectedDate: string | null;
  transport: "self" | "carpool";
  carpoolRole: "driver" | "passenger" | null;
  selectedPickup: string | null;
  seatCount: number | null;
}
```

- [ ] **Step 2: Update PackageOptions component**

Replace the transport radio with three options:

1. 自行前往 (`transport: "self"`)
2. 需要被載 (`transport: "carpool", carpoolRole: "passenger"`)
3. 可出車 (`transport: "carpool", carpoolRole: "driver"`)

When "可出車" selected, show seat_count number input (default 3, min 1, max 8).
When "需要被載" or "可出車" selected, show pickup location radios.

State: `const [transportChoice, setTransportChoice] = useState<"self" | "passenger" | "driver">("self");`

Map to PackageSelection:

- "self" → `{ transport: "self", carpoolRole: null, selectedPickup: null, seatCount: null }`
- "passenger" → `{ transport: "carpool", carpoolRole: "passenger", selectedPickup, seatCount: null }`
- "driver" → `{ transport: "carpool", carpoolRole: "driver", selectedPickup, seatCount }`

- [ ] **Step 3: Add i18n keys**

In `messages/zh-TW.json` under `eventDetail`:

```json
{
  "selfArrival": "自行前往",
  "needRide": "需要被載",
  "canDrive": "可出車",
  "canDriveNote": "依載客人數退還活動費用",
  "seatCount": "可載人數",
  "seatCountUnit": "人"
}
```

- [ ] **Step 4: Update consumer components that use PackageSelection**

Grep for `PackageSelection` usage and update consumers (RegistrationModal, EventPriceSidebar) to pass the new fields to the registration API body.

- [ ] **Step 5: Run type check + build**

Run: `pnpm tsc --noEmit && pnpm build`
Expected: Pass.

- [ ] **Step 6: Commit**

```bash
git add components/pages/event-detail/ messages/
git commit -m "feat(ui): redesign transport options to 自行前往/需要被載/可出車"
```

---

### Task 7: Dead Code Cleanup + Final Verification

**Files:**

- Modify: `lib/services/carpool.ts` (remove unused `seatCount` parameter from makeDriver)

- [ ] **Step 1: Verify makeDriver no longer uses seatCount parameter**

Check that `makeDriver` signature only has: `eventId, carGroup, location, driver, actualPassengerCount, event`. The old `seatCount` param should already be gone from Task 2.

- [ ] **Step 2: Search for dead references to old refund formula**

Run: `grep -r "seatCount.*carpool_surcharge\|carpool_surcharge.*seatCount" lib/ app/`
Expected: No matches.

- [ ] **Step 3: Run full test suite + type check + build**

Run: `pnpm vitest run && pnpm tsc --noEmit && pnpm build`
Expected: All pass, build succeeds.

- [ ] **Step 4: Commit if any cleanup was needed**

```bash
git add -A
git commit -m "refactor(carpool): remove dead code from old refund formula"
```

---

## Execution Order

```
Task 1 (DB + types) → Task 2 (refund calc) → Tasks 3-6 (parallel) → Task 7 (cleanup)
```

Tasks 3, 4, 5, 6 are independent after Task 2 completes. They can be dispatched to parallel agents.

## Open Tickets to Create

| ID      | Title                                                     | Type  |
| ------- | --------------------------------------------------------- | ----- |
| SYW-053 | DB: add driver_refund_per_passenger + carpool_cutoff_days | chore |
| SYW-054 | Carpool refund calculation: per-passenger model           | feat  |
| SYW-055 | Cron: assign-carpool + role confirmation email            | feat  |
| SYW-056 | Frontend: transport options redesign                      | feat  |
| SYW-057 | LINE link + 集合注意事項 placeholder replacement          | chore |

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";

vi.mock("@/lib/supabase/client", () => ({
  getSupabase: vi.fn(),
}));

import { getSupabase } from "@/lib/supabase/client";
import { assignCarpool, buildAssignments } from "@/lib/services/carpool";
import type { EventRow, RegistrationRow } from "@/lib/types/database";

const baseEvent: EventRow = {
  id: "evt-1",
  type: "trip",
  location: "宜蘭",
  title: "Test event",
  start_date: "2026-05-01",
  end_date: "2026-05-02",
  base_price: 1000,
  carpool_surcharge: 100,
  payment_days: 7,
  min_participants: 4,
  status: "open",
  first_created_at: "2026-04-01T00:00:00Z",
};

function makeReg(overrides: Partial<RegistrationRow>): RegistrationRow {
  return {
    id: "reg-default",
    event_id: "evt-1",
    name: "Test User",
    email: "test@example.com",
    phone: "0900000000",
    line_id: null,
    gender: "other",
    id_number: "A123456789",
    birthday: "1990-01-01",
    emergency_contact_name: "Em",
    emergency_contact_phone: "0911111111",
    dietary: "omnivore",
    wants_rental: false,
    notes: null,
    transport: "carpool",
    pickup_location: "台北",
    carpool_role: "passenger",
    seat_count: null,
    amount_due: 1100,
    payment_ref: null,
    status: "paid",
    created_at: "2026-04-01T00:00:00Z",
    confirmed_at: "2026-04-02T00:00:00Z",
    expires_at: "2026-04-08T00:00:00Z",
    ...overrides,
  };
}

function makeEventChain(result: { data: unknown; error: unknown }) {
  return {
    select: () => ({
      eq: () => ({
        single: vi.fn().mockResolvedValue(result),
      }),
    }),
  };
}

function makeRegsChain(result: { data: unknown; error: unknown }) {
  return {
    select: () => ({
      eq: () => ({
        eq: () => ({
          eq: vi.fn().mockResolvedValue(result),
        }),
      }),
    }),
  };
}

function makeDeleteChain(result: { error: unknown }) {
  return {
    delete: () => ({
      eq: vi.fn().mockResolvedValue(result),
    }),
  };
}

function makeInsertChain(result: { data: unknown; error: unknown }) {
  return {
    insert: () => ({
      select: vi.fn().mockResolvedValue(result),
    }),
  };
}

function setupSupabaseMock(chains: unknown[]) {
  const fromMock = vi.fn();
  for (const chain of chains) {
    fromMock.mockReturnValueOnce(chain);
  }
  // SupabaseClient is opaque 3rd-party type; building a full mock is impractical.
  // assignCarpool only uses .from(), so we narrow via unknown to the partial shape we control.
  vi.mocked(getSupabase).mockReturnValue({
    from: fromMock,
  } as unknown as SupabaseClient);
}

describe("buildAssignments", () => {
  it("一位司機帶滿三位乘客，分成同一組", () => {
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

    const result = buildAssignments("evt-1", baseEvent, [
      driver,
      ...passengers,
    ]);

    expect(result).toHaveLength(4);
    expect(result[0]).toMatchObject({
      registration_id: "drv-1",
      final_role: "driver",
      car_group: 1,
      refund_amount: 400,
    });
    expect(result.slice(1)).toEqual(
      passengers.map((p) => ({
        event_id: "evt-1",
        car_group: 1,
        pickup_location: "台北",
        registration_id: p.id,
        final_role: "passenger",
        refund_amount: 0,
      }))
    );
  });

  it("司機座位有剩，乘客不足只填部分位子", () => {
    const driver = makeReg({
      id: "drv-1",
      carpool_role: "driver",
      seat_count: 3,
    });
    const passengers = [makeReg({ id: "p-1" }), makeReg({ id: "p-2" })];

    const result = buildAssignments("evt-1", baseEvent, [
      driver,
      ...passengers,
    ]);

    expect(result).toHaveLength(3);
    expect(result[0]).toMatchObject({
      registration_id: "drv-1",
      final_role: "driver",
      car_group: 1,
    });
    expect(result.slice(1).map((r) => r.registration_id)).toEqual([
      "p-1",
      "p-2",
    ]);
    expect(result.every((r) => r.car_group === 1)).toBe(true);
  });

  it("乘客超過座位數，多餘乘客進無司機組", () => {
    const driver = makeReg({
      id: "drv-1",
      carpool_role: "driver",
      seat_count: 3,
    });
    const passengers = [
      makeReg({ id: "p-1" }),
      makeReg({ id: "p-2" }),
      makeReg({ id: "p-3" }),
      makeReg({ id: "p-4" }),
      makeReg({ id: "p-5" }),
    ];

    const result = buildAssignments("evt-1", baseEvent, [
      driver,
      ...passengers,
    ]);

    expect(result).toHaveLength(6);

    expect(result.slice(0, 4).every((r) => r.car_group === 1)).toBe(true);
    expect(result[0].final_role).toBe("driver");
    expect(result.slice(1, 4).map((r) => r.registration_id)).toEqual([
      "p-1",
      "p-2",
      "p-3",
    ]);

    expect(result.slice(4).every((r) => r.car_group === 2)).toBe(true);
    expect(result.slice(4).every((r) => r.final_role === "passenger")).toBe(
      true
    );
    expect(result.slice(4).map((r) => r.registration_id)).toEqual([
      "p-4",
      "p-5",
    ]);
  });

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
      refund_amount: 500,
    });
    expect(result[1]).toMatchObject({
      registration_id: "drv-B",
      final_role: "passenger",
      car_group: 1,
      refund_amount: 0,
    });
  });

  it("地點只有乘客沒有司機，全員進無司機組", () => {
    const passengers = [
      makeReg({ id: "p-1" }),
      makeReg({ id: "p-2" }),
      makeReg({ id: "p-3" }),
    ];

    const result = buildAssignments("evt-1", baseEvent, passengers);

    expect(result).toHaveLength(3);
    expect(result.every((r) => r.car_group === 1)).toBe(true);
    expect(result.every((r) => r.final_role === "passenger")).toBe(true);
    expect(result.every((r) => r.refund_amount === 0)).toBe(true);
    expect(result.map((r) => r.registration_id)).toEqual(["p-1", "p-2", "p-3"]);
  });

  it("pickup_location 為 null 的報名被排除", () => {
    const driver = makeReg({
      id: "drv-1",
      carpool_role: "driver",
      seat_count: 3,
    });
    const validPassenger = makeReg({ id: "p-1" });
    const nullLocPassenger = makeReg({ id: "p-null", pickup_location: null });

    const result = buildAssignments("evt-1", baseEvent, [
      driver,
      validPassenger,
      nullLocPassenger,
    ]);

    const ids = result.map((r) => r.registration_id);
    expect(ids).not.toContain("p-null");
    expect(ids).toEqual(["drv-1", "p-1"]);
  });

  it("沒有任何報名，回傳空陣列", () => {
    const result = buildAssignments("evt-1", baseEvent, []);
    expect(result).toEqual([]);
  });

  // CHARACTERIZATION: locks current behavior — `seat_count ?? 3` (carpool.ts:109)
  // defaults missing driver capacity to 3 silently. Spec source unclear; revisit
  // if business defines this rule explicitly.
  it("司機 seat_count 為 null 時 fallback 走 3 座", () => {
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

    const result = buildAssignments("evt-1", baseEvent, [
      driver,
      ...passengers,
    ]);

    expect(result).toHaveLength(5);
    expect(result.slice(0, 4).every((r) => r.car_group === 1)).toBe(true);
    expect(result[0]).toMatchObject({
      final_role: "driver",
      refund_amount: 400,
    });
    expect(result[4]).toMatchObject({
      car_group: 2,
      final_role: "passenger",
      registration_id: "p-4",
    });
  });

  it("多地點各自獨立分組，car_group 編號連續", () => {
    const taipeiDriver = makeReg({
      id: "tp-drv",
      carpool_role: "driver",
      seat_count: 3,
      pickup_location: "台北",
    });
    const taipeiPassenger = makeReg({ id: "tp-p", pickup_location: "台北" });
    const ksDriver = makeReg({
      id: "ks-drv",
      carpool_role: "driver",
      seat_count: 3,
      pickup_location: "高雄",
    });
    const ksPassenger = makeReg({ id: "ks-p", pickup_location: "高雄" });

    const result = buildAssignments("evt-1", baseEvent, [
      taipeiDriver,
      ksDriver,
      taipeiPassenger,
      ksPassenger,
    ]);

    expect(result).toHaveLength(4);

    const taipei = result.filter((r) => r.pickup_location === "台北");
    const ks = result.filter((r) => r.pickup_location === "高雄");
    expect(taipei.every((r) => r.car_group === 1)).toBe(true);
    expect(ks.every((r) => r.car_group === 2)).toBe(true);
  });
});

describe("assignCarpool", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("event 不存在時回傳 fail(404)", async () => {
    setupSupabaseMock([
      makeEventChain({ data: null, error: { message: "not found" } }),
    ]);

    const result = await assignCarpool("evt-not-exist");

    expect(result).toEqual({
      ok: false,
      error: "Event not found",
      status: 404,
    });
  });

  it("registrations 讀取失敗時回傳 fail(500)", async () => {
    setupSupabaseMock([
      makeEventChain({ data: baseEvent, error: null }),
      makeRegsChain({ data: null, error: { message: "DB connection lost" } }),
    ]);

    const result = await assignCarpool("evt-1");

    expect(result).toEqual({
      ok: false,
      error: "DB connection lost",
      status: 500,
    });
  });

  it("delete 舊指派失敗時回傳 fail(500)", async () => {
    const driver = makeReg({
      id: "drv-1",
      carpool_role: "driver",
      seat_count: 3,
    });

    setupSupabaseMock([
      makeEventChain({ data: baseEvent, error: null }),
      makeRegsChain({ data: [driver], error: null }),
      makeDeleteChain({ error: { message: "delete failed" } }),
    ]);

    const result = await assignCarpool("evt-1");

    expect(result).toEqual({
      ok: false,
      error: "delete failed",
      status: 500,
    });
  });

  it("insert 新指派失敗時回傳 fail(500)", async () => {
    const driver = makeReg({
      id: "drv-1",
      carpool_role: "driver",
      seat_count: 3,
    });

    setupSupabaseMock([
      makeEventChain({ data: baseEvent, error: null }),
      makeRegsChain({ data: [driver], error: null }),
      makeDeleteChain({ error: null }),
      makeInsertChain({ data: null, error: { message: "insert failed" } }),
    ]);

    const result = await assignCarpool("evt-1");

    expect(result).toEqual({
      ok: false,
      error: "insert failed",
      status: 500,
    });
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/client", () => ({
  getSupabase: vi.fn(),
}));

import { EventNotFoundError, InternalError } from "@/lib/errors/domain";
import { assignCarpool, buildAssignments } from "@/lib/services/carpool";
import { makeEvent, makeRegistration } from "@/lib/test-utils/fixtures";
import {
  makeSingleChain,
  setupSupabaseMock,
} from "@/lib/test-utils/supabase-mock";

const baseEvent = makeEvent();

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

describe("buildAssignments", () => {
  it("一位司機帶滿三位乘客，分成同一組", () => {
    const driver = makeRegistration({
      id: "drv-1",
      carpool_role: "driver",
      seat_count: 3,
    });
    const passengers = [
      makeRegistration({ id: "p-1" }),
      makeRegistration({ id: "p-2" }),
      makeRegistration({ id: "p-3" }),
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
      refund_amount: 600,
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
    const driver = makeRegistration({
      id: "drv-1",
      carpool_role: "driver",
      seat_count: 3,
    });
    const passengers = [
      makeRegistration({ id: "p-1" }),
      makeRegistration({ id: "p-2" }),
    ];

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
    const driver = makeRegistration({
      id: "drv-1",
      carpool_role: "driver",
      seat_count: 3,
    });
    const passengers = [
      makeRegistration({ id: "p-1" }),
      makeRegistration({ id: "p-2" }),
      makeRegistration({ id: "p-3" }),
      makeRegistration({ id: "p-4" }),
      makeRegistration({ id: "p-5" }),
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
    const drvA = makeRegistration({
      id: "drv-A",
      carpool_role: "driver",
      seat_count: 4,
    });
    const drvB = makeRegistration({
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
      refund_amount: 200,
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
      makeRegistration({ id: "p-1" }),
      makeRegistration({ id: "p-2" }),
      makeRegistration({ id: "p-3" }),
    ];

    const result = buildAssignments("evt-1", baseEvent, passengers);

    expect(result).toHaveLength(3);
    expect(result.every((r) => r.car_group === 1)).toBe(true);
    expect(result.every((r) => r.final_role === "passenger")).toBe(true);
    expect(result.every((r) => r.refund_amount === 0)).toBe(true);
    expect(result.map((r) => r.registration_id)).toEqual(["p-1", "p-2", "p-3"]);
  });

  it("pickup_location 為 null 的報名被排除", () => {
    const driver = makeRegistration({
      id: "drv-1",
      carpool_role: "driver",
      seat_count: 3,
    });
    const validPassenger = makeRegistration({ id: "p-1" });
    const nullLocPassenger = makeRegistration({
      id: "p-null",
      pickup_location: null,
    });

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
    const driver = makeRegistration({
      id: "drv-1",
      carpool_role: "driver",
      seat_count: null,
    });
    const passengers = [
      makeRegistration({ id: "p-1" }),
      makeRegistration({ id: "p-2" }),
      makeRegistration({ id: "p-3" }),
      makeRegistration({ id: "p-4" }),
    ];

    const result = buildAssignments("evt-1", baseEvent, [
      driver,
      ...passengers,
    ]);

    expect(result).toHaveLength(5);
    expect(result.slice(0, 4).every((r) => r.car_group === 1)).toBe(true);
    expect(result[0]).toMatchObject({
      final_role: "driver",
      refund_amount: 600,
    });
    expect(result[4]).toMatchObject({
      car_group: 2,
      final_role: "passenger",
      registration_id: "p-4",
    });
  });

  it("多地點各自獨立分組，car_group 編號連續", () => {
    const taipeiDriver = makeRegistration({
      id: "tp-drv",
      carpool_role: "driver",
      seat_count: 3,
      pickup_location: "台北",
    });
    const taipeiPassenger = makeRegistration({
      id: "tp-p",
      pickup_location: "台北",
    });
    const ksDriver = makeRegistration({
      id: "ks-drv",
      carpool_role: "driver",
      seat_count: 3,
      pickup_location: "高雄",
    });
    const ksPassenger = makeRegistration({
      id: "ks-p",
      pickup_location: "高雄",
    });

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

  it("event 不存在時 throw EventNotFoundError", async () => {
    setupSupabaseMock([
      makeSingleChain({ data: null, error: { message: "not found" } }),
    ]);

    await expect(assignCarpool("evt-not-exist")).rejects.toThrow(
      EventNotFoundError
    );
  });

  it("registrations 讀取失敗時 throw InternalError", async () => {
    setupSupabaseMock([
      makeSingleChain({ data: baseEvent, error: null }),
      makeRegsChain({ data: null, error: { message: "DB connection lost" } }),
    ]);

    await expect(assignCarpool("evt-1")).rejects.toThrow(InternalError);
  });

  it("RPC replace 失敗時 throw InternalError", async () => {
    const driver = makeRegistration({
      id: "drv-1",
      carpool_role: "driver",
      seat_count: 3,
    });

    setupSupabaseMock(
      [
        makeSingleChain({ data: baseEvent, error: null }),
        makeRegsChain({ data: [driver], error: null }),
      ],
      { rpcResult: { error: { message: "rpc failed" } } }
    );

    await expect(assignCarpool("evt-1")).rejects.toThrow(InternalError);
  });
});

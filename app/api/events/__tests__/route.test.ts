import { describe, it, expect } from "vitest";
import { GET } from "../route";
import { EVENTS } from "@/lib/constants";

describe("GET /api/events", () => {
  it("returns a response with events data", async () => {
    const response = await GET();
    const body = await response.json();

    expect(body.data).toEqual(EVENTS);
    expect(body.meta.total).toBe(EVENTS.length);
  });

  it("response has Cache-Control header", async () => {
    const response = await GET();
    expect(response.headers.get("Cache-Control")).toContain("public");
  });

  it("response content-type is application/json", async () => {
    const response = await GET();
    expect(response.headers.get("content-type")).toContain("application/json");
  });
});

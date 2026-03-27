import { describe, it, expect } from "vitest";
import { GET } from "../../events/[id]/route";
import { EVENTS } from "@/lib/constants";

describe("GET /api/events/[id]", () => {
  it("returns a single event by valid id", async () => {
    const validId = EVENTS[0].id;
    const request = new Request("http://localhost/api/events/" + validId);
    const response = await GET(request, { params: Promise.resolve({ id: validId }) });
    const body = await response.json();

    expect(body.data.id).toBe(validId);
    expect(body.data.title).toBe(EVENTS[0].title);
  });

  it("returns 404 for an invalid id", async () => {
    const request = new Request("http://localhost/api/events/nonexistent");
    const response = await GET(request, { params: Promise.resolve({ id: "nonexistent" }) });

    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.error).toBe("Event not found");
  });

  it("response has Cache-Control header for valid event", async () => {
    const validId = EVENTS[0].id;
    const request = new Request("http://localhost/api/events/" + validId);
    const response = await GET(request, { params: Promise.resolve({ id: validId }) });

    expect(response.headers.get("Cache-Control")).toContain("public");
  });
});

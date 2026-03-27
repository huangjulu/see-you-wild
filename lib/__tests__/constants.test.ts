import { describe, it, expect } from "vitest";
import { EVENTS, INSTAGRAM_URL, INSTAGRAM_HANDLE, SITE_URL, NAV_LINKS } from "../constants";

describe("EVENTS", () => {
  it("is a non-empty array", () => {
    expect(Array.isArray(EVENTS)).toBe(true);
    expect(EVENTS.length).toBeGreaterThan(0);
  });

  it.each(EVENTS)("event '$title' has all required fields", (event) => {
    expect(event.title).toBeTruthy();
    expect(event.date).toBeTruthy();
    expect(event.location ?? event.description).toBeTruthy();
    expect(event.description).toBeTruthy();
    expect(event.image).toBeTruthy();
    expect(["solid", "ghost"]).toContain(event.variant);
  });
});

describe("Social / navigation links", () => {
  it("INSTAGRAM_URL is a valid URL", () => {
    expect(INSTAGRAM_URL).toMatch(/^https?:\/\//);
  });

  it("INSTAGRAM_HANDLE starts with @", () => {
    expect(INSTAGRAM_HANDLE).toMatch(/^@/);
  });

  it("SITE_URL is a valid URL", () => {
    expect(SITE_URL).toMatch(/^https?:\/\//);
  });

  it("NAV_LINKS each have label and href", () => {
    NAV_LINKS.forEach((link) => {
      expect(link.label).toBeTruthy();
      expect(link.href).toBeTruthy();
    });
  });
});

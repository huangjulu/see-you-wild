import { describe, expect, it } from "vitest";

import {
  EVENTS_CONFIG,
  INSTAGRAM_HANDLE,
  INSTAGRAM_URL,
  NAV_ANCHORS,
  SITE_URL,
} from "../constants";

describe("EVENTS_CONFIG", () => {
  it("is a non-empty array", () => {
    expect(Array.isArray(EVENTS_CONFIG)).toBe(true);
    expect(EVENTS_CONFIG.length).toBeGreaterThan(0);
  });

  it.each(EVENTS_CONFIG)(
    "event config '$id' has all required fields",
    (config) => {
      expect(config.id).toBeTruthy();
      expect(config.image).toBeTruthy();
      expect(config.ctaUrl).toBeTruthy();
      expect(["solid", "ghost"]).toContain(config.theme);
    }
  );
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

  it("NAV_ANCHORS each have a value", () => {
    Object.values(NAV_ANCHORS).forEach((anchor: string) => {
      expect(anchor).toBeTruthy();
    });
  });
});

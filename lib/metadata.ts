import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "./constants";

export function createMetadata(overrides: Partial<Metadata> = {}): Metadata {
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: SITE_NAME,
      template: `%s | ${SITE_NAME}`,
    },
    ...overrides,
  };
}

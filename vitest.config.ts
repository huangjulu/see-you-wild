import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
  },
  resolve: {
    alias: [
      {
        find: /^@\/lib\/i18n\/navigation$/,
        replacement: path.resolve(
          __dirname,
          "__mocks__/lib/i18n/navigation.ts"
        ),
      },
      {
        find: "@",
        replacement: path.resolve(__dirname, "."),
      },
    ],
  },
});

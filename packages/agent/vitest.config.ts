import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    globals: true,
    root: resolve(__dirname),
    include: ["__tests__/**/*.test.ts"],
  },
});

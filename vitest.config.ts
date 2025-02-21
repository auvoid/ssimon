import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true, // Enables Jest-like global functions (e.g., mock, spyOn)
    environment: "node", // Needed for backend projects
    coverage: {
      provider: "v8", // or 'c8' if needed
    },

    include: ["src/tests/**/test.ts"], // Only match E2E tests in the test folder
  },
  resolve: {
    alias: {
      "@tanglelabs/ssimon": "./src/index.ts",
    },
  },
});

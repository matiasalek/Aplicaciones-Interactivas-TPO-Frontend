import { defineConfig } from "@playwright/test";

if (
  process.env.E2E_ALLOW_WRITES === "1" &&
  !process.env.E2E_ADMIN_INVITE_CODE?.trim()
) {
  throw new Error(
    "Configurá E2E_ADMIN_INVITE_CODE con el código de la API de pruebas.",
  );
}

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 120000,
  expect: { timeout: 10000 },
  reporter: "list",
  use: {
    actionTimeout: 10000,
    navigationTimeout: 15000,
    baseURL: "http://127.0.0.1:5173",
    browserName: "chromium",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "npm run dev",
    url: "http://127.0.0.1:5173",
    reuseExistingServer: false,
    timeout: 30000,
  },
});

import { existsSync } from "node:fs";
import { defineConfig } from "@playwright/test";

const port = Number(process.env.PORT ?? "4173");
const baseURL = process.env.E2E_BASE_URL ?? `http://127.0.0.1:${port}`;
const useExternalTarget = Boolean(process.env.E2E_BASE_URL);
const bundledExecutableOverride = [
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
].find((candidate): candidate is string =>
  Boolean(candidate) && existsSync(candidate),
);

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: /.*\.spec\.ts/,
  timeout: 60_000,
  fullyParallel: false,
  reporter: "list",
  use: {
    baseURL,
    headless: true,
    launchOptions: bundledExecutableOverride
      ? { executablePath: bundledExecutableOverride }
      : undefined,
  },
  webServer: useExternalTarget
    ? undefined
    : {
        command: `npm run dev -- --hostname 127.0.0.1 --port ${port}`,
        url: baseURL,
        reuseExistingServer: true,
        timeout: 120_000,
      },
});

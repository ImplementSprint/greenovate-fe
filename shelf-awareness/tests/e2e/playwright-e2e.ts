import { spawn } from "node:child_process";
import process from "node:process";
import { chromium, firefox, webkit } from "playwright";

type BrowserName = "chromium" | "firefox" | "webkit";

const LOGIN_PAGE_MARKERS = ["Admin Portal Login", "Employee ID"];
const DEFAULT_SMOKE_PATH = "/login";

function hasExpectedLoginMarker(text: string): boolean {
  return LOGIN_PAGE_MARKERS.every((marker) => text.includes(marker));
}

function isProtectedPreview(status: number | undefined, text: string): boolean {
  if (status === 401 || status === 403) {
    return true;
  }

  const normalized = text.toLowerCase();
  return (
    normalized.includes("authentication required") ||
    normalized.includes("access denied") ||
    normalized.includes("vercel authentication") ||
    normalized.includes("password required")
  );
}

function resolveBrowser(name: string): BrowserName {
  if (name === "firefox" || name === "webkit") {
    return name;
  }

  return "chromium";
}

function launchBrowser(name: BrowserName) {
  switch (name) {
    case "firefox":
      return firefox.launch({ headless: true });
    case "webkit":
      return webkit.launch({ headless: true });
    default:
      return chromium.launch({ headless: true });
  }
}

async function waitForServer(url: string, timeoutMs = 45_000): Promise<void> {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url, { method: "GET" });
      if (response.status >= 200 && response.status < 500) {
        return;
      }
    } catch {
      // Server is not ready yet.
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error(`Timed out waiting for server at ${url}`);
}

async function main() {
  const port = process.env.PORT || "3000";
  const baseUrl = process.env.E2E_BASE_URL || `http://127.0.0.1:${port}`;
  const smokePath = process.env.E2E_SMOKE_PATH || DEFAULT_SMOKE_PATH;
  const targetUrl = new URL(smokePath, `${baseUrl}/`).toString();
  const browserName = resolveBrowser(process.env.E2E_BROWSER || "chromium");
  const isExternalTarget = Boolean(process.env.E2E_BASE_URL);
  const waitTimeoutMs = isExternalTarget ? 120_000 : 45_000;

  const app = isExternalTarget
    ? null
    : spawn("npm", ["run", "dev", "--", "--hostname", "127.0.0.1", "--port", port], {
        stdio: "inherit",
        shell: process.platform === "win32",
        env: process.env,
      });

  try {
    await waitForServer(targetUrl, waitTimeoutMs);

    const browser = await launchBrowser(browserName);
    try {
      const page = await browser.newPage();
      page.setDefaultNavigationTimeout(waitTimeoutMs);
      const response = await page.goto(targetUrl, {
        timeout: waitTimeoutMs,
        waitUntil: "domcontentloaded",
      });
      const status = response?.status();
      const text = (await page.textContent("body")) || "";

      if (isExternalTarget && isProtectedPreview(status, text)) {
        console.log(
          `Playwright smoke reached protected preview on ${browserName} (status: ${status ?? "unknown"})`,
        );
        return;
      }

      if (!hasExpectedLoginMarker(text)) {
        throw new Error(
          `Expected login page content was not found at ${targetUrl} (status: ${status ?? "unknown"})`,
        );
      }
    } finally {
      await browser.close();
    }

    console.log(`Playwright smoke test passed on ${browserName}`);
  } finally {
    app?.kill();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

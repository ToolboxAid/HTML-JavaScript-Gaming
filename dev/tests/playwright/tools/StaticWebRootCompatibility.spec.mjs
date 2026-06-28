import { expect, test } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";

const repoRoot = path.resolve(fileURLToPath(new URL("../../../..", import.meta.url)));

test("repo server preserves current public route URLs with default root serving", async ({ page }) => {
  const server = await startRepoServer();
  try {
    const homeResponse = await page.goto(`${server.baseUrl}/index.html`, { waitUntil: "domcontentloaded" });
    expect(homeResponse?.status()).toBe(200);

    const toolboxResponse = await page.goto(`${server.baseUrl}/toolbox/index.html`, { waitUntil: "domcontentloaded" });
    expect(toolboxResponse?.status()).toBe(200);

    const assetResponse = await page.request.get(`${server.baseUrl}/assets/theme-v2/css/theme.css`);
    expect(assetResponse.status()).toBe(200);
  } finally {
    await server.close();
  }
});

test("repo server can prefer a configured web root while preserving public route URLs", async ({ page }) => {
  const fixtureRoot = path.join(repoRoot, "dev", "workspace", "tmp", "playwright-static-web-root");
  await fs.rm(fixtureRoot, { force: true, recursive: true });
  await fs.mkdir(path.join(fixtureRoot, "assets"), { recursive: true });
  await fs.writeFile(path.join(fixtureRoot, "index.html"), "<!doctype html><title>Fixture Web Root</title>", "utf8");
  await fs.writeFile(path.join(fixtureRoot, "assets", "probe.txt"), "fixture asset", "utf8");

  const server = await startRepoServer({ webRoot: fixtureRoot });
  try {
    const homeResponse = await page.goto(`${server.baseUrl}/index.html`, { waitUntil: "domcontentloaded" });
    expect(homeResponse?.status()).toBe(200);
    await expect(page).toHaveTitle("Fixture Web Root");

    const assetResponse = await page.request.get(`${server.baseUrl}/assets/probe.txt`);
    expect(assetResponse.status()).toBe(200);
    expect(await assetResponse.text()).toBe("fixture asset");
  } finally {
    await server.close();
    await fs.rm(fixtureRoot, { force: true, recursive: true });
  }
});

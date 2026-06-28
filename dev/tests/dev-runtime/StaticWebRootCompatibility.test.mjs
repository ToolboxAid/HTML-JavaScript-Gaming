import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { startStaticWebServer } from "../../scripts/start-dev.mjs";
import {
  DEFAULT_LOCAL_WEB_ROOT,
  LOCAL_WEB_ROOT_ENV,
  REPO_ROOT_LOCAL_WEB_ROOT,
  WWW_LOCAL_WEB_ROOT,
  resolveBrowserRoutePath,
  resolveLocalWebRoot,
  resolveStaticRouteTarget,
} from "../../../api/server/static-web-root.mjs";

const repoRoot = path.resolve(fileURLToPath(new URL("../../..", import.meta.url)));

test("local web root defaults to www and can be pointed at the repository root", () => {
  const defaultRoot = resolveLocalWebRoot({ env: {}, repoRoot });
  assert.equal(defaultRoot.relativePath, DEFAULT_LOCAL_WEB_ROOT);
  assert.equal(defaultRoot.absolutePath, path.join(repoRoot, "www"));
  assert.equal(defaultRoot.source, "default");

  const repoRootConfig = resolveLocalWebRoot({
    env: {
      [LOCAL_WEB_ROOT_ENV]: "repo-root",
    },
    repoRoot,
  });
  assert.equal(repoRootConfig.relativePath, REPO_ROOT_LOCAL_WEB_ROOT);
  assert.equal(repoRootConfig.absolutePath, repoRoot);
  assert.equal(repoRootConfig.source, "configured");
});

test("browser route compatibility preserves public URLs while normalizing filesystem lookup", () => {
  assert.equal(resolveBrowserRoutePath("/"), "/index.html");
  assert.equal(resolveBrowserRoutePath("/index.html"), "/index.html");
  assert.equal(resolveBrowserRoutePath("/toolbox/index.html"), "/toolbox/index.html");
  assert.equal(resolveBrowserRoutePath("/tools/game-design/index.html"), "/toolbox/game-design/index.html");
  assert.equal(resolveBrowserRoutePath("/assets/theme-v2/css/theme.css"), "/assets/theme-v2/css/theme.css");
  assert.equal(resolveBrowserRoutePath("/account/sign-in.html"), "/account/sign-in.html");
  assert.equal(resolveBrowserRoutePath("/admin/system-health.html"), "/admin/system-health.html");
  assert.equal(resolveBrowserRoutePath("/games/index.html"), "/games/index.html");
});

test("static route target can prefer a configured www root before repo-root fallback", async () => {
  const routeTarget = await resolveStaticRouteTarget({
    decodedPath: "/index.html",
    repoRoot,
    webRoot: WWW_LOCAL_WEB_ROOT,
  });
  assert.equal(routeTarget.routePath, "/index.html");
  assert.equal(routeTarget.targetPath, path.join(repoRoot, "www", "index.html"));
  assert.equal(routeTarget.webRoot.relativePath, "www");
});

test("local static web server can serve from a configurable web root", async () => {
  const fixtureRoot = path.join(repoRoot, "dev", "workspace", "tmp", "static-web-root-compatibility");
  await fs.rm(fixtureRoot, { force: true, recursive: true });
  await fs.mkdir(path.join(fixtureRoot, "assets"), { recursive: true });
  await fs.writeFile(path.join(fixtureRoot, "index.html"), "<!doctype html><title>Fixture Root</title>", "utf8");
  await fs.writeFile(path.join(fixtureRoot, "assets", "probe.txt"), "fixture asset", "utf8");

  const server = await startStaticWebServer({
    apiBaseUrl: "http://127.0.0.1:1",
    port: 0,
    webRoot: fixtureRoot,
  });

  try {
    const indexResponse = await fetch(`${server.baseUrl}/index.html`);
    assert.equal(indexResponse.status, 200);
    assert.match(await indexResponse.text(), /Fixture Root/);

    const assetResponse = await fetch(`${server.baseUrl}/assets/probe.txt`);
    assert.equal(assetResponse.status, 200);
    assert.equal(await assetResponse.text(), "fixture asset");
  } finally {
    await server.close();
    await fs.rm(fixtureRoot, { force: true, recursive: true });
  }
});

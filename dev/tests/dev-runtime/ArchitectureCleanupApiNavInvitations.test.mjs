import fs from "node:fs";
import http from "node:http";
import test from "node:test";
import assert from "node:assert/strict";
import { createLocalApiRouter } from "../../../api/server/local-api-router.mjs";
import {
  getAdminNavigationItems,
  getOwnerNavigationItems,
} from "../../../www/src/api/admin-owner-navigation.js";
import { SEED_DB_KEYS } from "../../../api/seed/seed-db-keys.mjs";

const MOVED_API_CLIENTS = Object.freeze([
  "admin-infrastructure-api-client.js",
  "admin-invitations-api-client.js",
  "admin-operations-api-client.js",
  "admin-setup-api-client.js",
  "admin-system-health-api-client.js",
  "ai-credits-api-client.js",
  "db-viewer-api-client.js",
  "db-viewer-ui.js",
  "legal-api-client.js",
  "marketplace-api-client.js",
  "memberships-api-client.js",
  "owner-ai-credits-api-client.js",
  "owner-memberships-api-client.js",
  "platform-settings-api-client.js",
  "session-api-client.js",
  "toolbox-votes-api-client.js",
]);

function startApiServer() {
  const handleRequest = createLocalApiRouter();
  const server = http.createServer((request, response) => {
    const address = server.address();
    const port = address && typeof address !== "string" ? address.port : 0;
    const requestUrl = new URL(request.url || "/", `http://127.0.0.1:${port}`);
    handleRequest(request, response, requestUrl).catch((error) => {
      response.statusCode = error?.statusCode || 500;
      response.setHeader("Content-Type", "application/json; charset=utf-8");
      response.end(JSON.stringify({
        error: error instanceof Error ? error.message : String(error || "Architecture cleanup test server error."),
        ok: false,
      }));
    });
  });
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("Unable to start architecture cleanup API server."));
        return;
      }
      resolve({
        baseUrl: `http://127.0.0.1:${address.port}`,
        close: () => new Promise((closeResolve) => {
          server.closeAllConnections?.();
          server.close(closeResolve);
        }),
      });
    });
  });
}

async function apiJson(baseUrl, pathName, request = {}) {
  const init = request.body === undefined
    ? request
    : {
      ...request,
      body: JSON.stringify(request.body),
      headers: {
        "content-type": "application/json",
        ...(request.headers || {}),
      },
    };
  const response = await fetch(`${baseUrl}${pathName}`, init);
  const payload = await response.json();
  assert.equal(response.status, 200, `${pathName} should return HTTP 200: ${payload.error || ""}`);
  assert.equal(payload.ok, true);
  return payload.data;
}

test("product and web API clients live under www/src/api while engine API keeps only shared server plumbing", () => {
  assert.equal(fs.existsSync("src/engine/api"), false);
  assert.equal(fs.existsSync("www/src/api/server-api-client.js"), true);
  MOVED_API_CLIENTS.forEach((fileName) => {
    assert.equal(fs.existsSync(`www/src/api/${fileName}`), true, `${fileName} should live under www/src/api`);
    assert.equal(fs.existsSync(`src/engine/api/${fileName}`), false, `${fileName} should not remain under src/engine/api`);
  });
});

test("Admin and Owner navigation are shared and include present operational/business pages", async () => {
  const adminLabels = getAdminNavigationItems().map((item) => item.label);
  const ownerLabels = getOwnerNavigationItems().map((item) => item.label);
  ["Admin Tools", "Creators", "Infrastructure", "Invites", "Operations", "System Health", "Tool Votes"].forEach((label) => {
    assert.equal(adminLabels.includes(label), true, `Admin navigation should include ${label}`);
  });
  ["Owner Tools", "AI Credits", "Branding", "Grouping Colors", "Memberships", "Revenue"].forEach((label) => {
    assert.equal(ownerLabels.includes(label), true, `Owner navigation should include ${label}`);
  });
  ["Branding", "Design System", "Grouping Colors", "Site Settings", "Themes"].forEach((label) => {
    assert.equal(adminLabels.includes(label), false, `Admin navigation should not include Owner business item ${label}`);
  });

  const server = await startApiServer();
  try {
    await apiJson(server.baseUrl, "/api/session/user", {
      body: { userKey: SEED_DB_KEYS.users.admin },
      method: "POST",
    });
    const payload = await apiJson(server.baseUrl, "/api/navigation/admin-menu");
    assert.deepEqual(payload.adminMainItems.map((item) => item.label), adminLabels);
    assert.deepEqual(payload.ownerMenuItems.map((item) => item.label), ownerLabels);
    assert.equal(payload.ownership.adminMainItems, "www/src/api/admin-owner-navigation.js");
    assert.equal(payload.ownership.ownerMenuItems, "www/src/api/admin-owner-navigation.js");
  } finally {
    await server.close();
  }
});

test("touched Admin and Owner pages do not duplicate sidebar navigation links", () => {
  [
    "www/admin/invitations.html",
    "www/admin/system-health.html",
    "www/admin/infrastructure.html",
    "www/admin/environments.html",
    "www/admin/game-migration.html",
    "www/admin/platform-settings.html",
    "www/admin/site-setup.html",
    "www/admin/tool-votes.html",
    "www/admin/users.html",
    "www/owner/ai-credits.html",
    "www/owner/branding.html",
    "www/owner/design-system.html",
    "www/owner/grouping-colors.html",
    "www/owner/memberships.html",
    "www/owner/site-settings.html",
    "www/owner/themes.html",
  ].forEach((fileName) => {
    const source = fs.readFileSync(fileName, "utf8");
    assert.equal(source.includes("assets/theme-v2/js/admin-owner-navigation.js"), true, `${fileName} should load shared nav renderer`);
    if (fileName.startsWith("www/owner/")) {
      assert.match(source, /data-owner-tool-menu/);
      assert.equal(source.includes("href=\"/owner/memberships.html\""), false);
    } else {
      assert.match(source, /data-admin-tool-menu/);
      assert.equal(source.includes("href=\"/admin/invitations.html\""), false);
    }
  });
});

test("API runtime boundary is documented for runtime implementation and not test ownership", () => {
  const source = fs.readFileSync("api/API_RUNTIME_BOUNDARY.md", "utf8");
  assert.match(source, /server\/API application runtime implementation/i);
  assert.match(source, /not `dev\/tests\/dev-runtime`/);
  assert.match(source, /Browser pages, Theme V2 scripts, toolbox pages, and `www\/src\/engine` runtime code must use declared API\/service contracts instead of importing `api\/` directly/);
});

test("Toolbox registry consumes shared metadata without importing dev-runtime", () => {
  const registrySource = fs.readFileSync("www/toolbox/toolRegistry.js", "utf8");
  const devRuntimeShim = fs.readFileSync("api/guest-seeds/tool-metadata-inventory.js", "utf8");
  assert.match(registrySource, /src\/shared\/toolbox\/tool-metadata-inventory\.js/);
  assert.doesNotMatch(registrySource, /src\/dev-runtime|src\\dev-runtime|dev-runtime\/guest-seeds/);
  assert.match(devRuntimeShim, /\.\.\/\.\.\/www\/src\/shared\/toolbox\/tool-metadata-inventory\.js/);
  assert.equal(fs.existsSync("www/src/shared/toolbox/tool-metadata-inventory.js"), true);
});

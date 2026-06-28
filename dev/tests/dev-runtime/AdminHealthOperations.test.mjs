import http from "node:http";
import test from "node:test";
import assert from "node:assert/strict";
import {
  adminOperationsHealth,
  createLocalApiRouter,
} from "../../../api/server/local-api-router.mjs";
import {
  debitAiCreditsForAction,
  grantMonthlyAiCredits,
} from "../../../api/ai/ai-credit-service.mjs";
import { assignUserMembership } from "../../../api/memberships/membership-assignment-service.mjs";
import { SEED_DB_KEYS, makeSeedUlid } from "../../../api/seed/seed-db-keys.mjs";
import { createServerSeedTables } from "../../../api/seed/server-seed-loader.mjs";

function createKeyFactory(start = 12000) {
  let sequence = start;
  return () => makeSeedUlid(sequence++);
}

function options(start = 12000) {
  return {
    actorKey: SEED_DB_KEYS.users.admin,
    createKey: createKeyFactory(start),
    now: "2026-06-18T12:00:00.000Z",
  };
}

function withEnv(nextEnv, callback) {
  const previousEnv = {};
  Object.keys(nextEnv).forEach((key) => {
    previousEnv[key] = process.env[key];
    if (nextEnv[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = nextEnv[key];
    }
  });
  return Promise.resolve()
    .then(callback)
    .finally(() => {
      Object.entries(previousEnv).forEach(([key, value]) => {
        if (value === undefined) {
          delete process.env[key];
        } else {
          process.env[key] = value;
        }
      });
    });
}

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
        error: error instanceof Error ? error.message : String(error || "Admin health operations test server error."),
        ok: false,
      }));
    });
  });
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("Unable to start Admin health operations API server."));
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

async function apiPayload(baseUrl, pathName, request = {}) {
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
  return { payload, status: response.status };
}

async function apiJson(baseUrl, pathName, request = {}) {
  const { payload, status } = await apiPayload(baseUrl, pathName, request);
  assert.equal(status, 200, `${pathName} should return 200: ${payload.error || ""}`);
  assert.equal(payload.ok, true);
  return payload.data;
}

test("Admin can view operational health while Creator sessions are blocked", async () => {
  await withEnv({
    GAMEFOUNDRY_API_URL: "http://api-user:api-secret@127.0.0.1:5501/api",
    GAMEFOUNDRY_ENVIRONMENT_LABEL: "Local",
    GAMEFOUNDRY_SITE_URL: "http://site-user:site-secret@127.0.0.1:5500",
    GAMEFOUNDRY_STORAGE_PROJECTS_PREFIX: "/local/projects/",
    GAMEFOUNDRY_SUPABASE_ANON_KEY: undefined,
    GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY: undefined,
    GAMEFOUNDRY_SUPABASE_URL: undefined,
  }, async () => {
    const server = await startApiServer();
    try {
      await apiJson(server.baseUrl, "/api/session/user", {
        body: { userKey: SEED_DB_KEYS.users.user1 },
        method: "POST",
      });
      const blocked = await apiPayload(server.baseUrl, "/api/admin/system-health/status");
      assert.equal(blocked.status, 403);
      assert.match(blocked.payload.error, /Admin role required/);

      await apiJson(server.baseUrl, "/api/session/user", {
        body: { userKey: SEED_DB_KEYS.users.admin },
        method: "POST",
      });
      const health = await apiJson(server.baseUrl, "/api/admin/system-health/status");
      assert.equal(health.environmentIdentity.name, "Local");
      assert.equal(health.environmentIdentity.hostingModel, "VS Code + Local API");
      assert.equal(health.environmentIdentity.databaseModel, "Local Docker PostgreSQL");
      assert.equal(health.environmentIdentity.storageFolder, "/local");
      assert.equal(health.environmentIdentity.siteUrl.includes("site-user"), false);
      assert.equal(health.environmentIdentity.apiUrl.includes("api-user"), false);
      assert.equal(health.databaseStatus.databaseType, "Local Docker PostgreSQL");
      assert.ok(["connected", "failed", "not configured"].includes(health.databaseStatus.connectivity));
      assert.equal(typeof health.databaseStatus.lastChecked, "string");
      assert.equal(typeof health.databaseStatus.responseTimeMs === "number" || health.databaseStatus.responseTimeMs === null, true);
      assert.equal(typeof health.databaseStatus.version, "string");
      assert.equal(health.postgresMetrics.secretEditingAllowed, false);
      assert.equal(health.postgresMetrics.secretsExposed, false);
      assert.deepEqual(
        health.postgresMetrics.rows.map((row) => row.metric),
        [
          "Connection status",
          "Database name",
          "Current schema",
          "Migration status",
          "Last migration",
          "Table count",
          "Database size",
          "Last checked",
        ],
      );
      assert.equal(health.postgresMetrics.rows.every((row) => typeof row.value === "string"), true);
      assert.equal(health.postgresMetrics.rows.some((row) => row.value === "Unavailable"), true);
      assert.equal(health.databaseStatus.postgresMetrics.rows.length, health.postgresMetrics.rows.length);
      assert.equal(health.runtimeHealth.environmentName, "Local");
      assert.equal(health.runtimeHealth.appVersion, "1.0.0");
      assert.equal(health.runtimeHealth.apiVersion, "1.0.0");
      assert.match(health.runtimeHealth.nodeVersion, /^v\d+\./);
      assert.equal(typeof health.runtimeHealth.serverStartTime, "string");
      assert.equal(typeof health.runtimeHealth.uptimeSeconds, "number");
      assert.equal(typeof health.runtimeHealth.lastChecked, "string");
      assert.deepEqual(
        health.serviceHealth.services.map((service) => service.label),
        ["Runtime", "API", "Database", "Storage", "Authentication", "Email", "Background Jobs"],
      );
      assert.equal(
        health.serviceHealth.services.every((service) => ["PASS", "WARN", "FAIL", "NOT CONFIGURED"].includes(service.status)),
        true,
      );
      assert.equal(health.serviceHealth.services.some((service) => service.status === "PASS"), true);
      assert.equal(health.serviceHealth.services.every((service) => typeof service.summary === "string"), true);
      assert.equal(JSON.stringify(health.serviceHealth).includes("/uat"), false);
      assert.deepEqual(
        health.configurationSummary.rows.map((row) => row.field),
        [
          "Current environment",
          "Hosting model",
          "Site URL",
          "API URL",
          "API URL source",
          "Site URL source",
          "Database provider/type",
          "Storage provider/folder",
          "Storage endpoint",
          "Storage projects prefix",
          "Auth provider/status",
        ],
      );
      assert.equal(health.configurationSummary.rows.find((row) => row.field === "API URL source")?.value, "GAMEFOUNDRY_API_URL");
      assert.equal(health.configurationSummary.rows.find((row) => row.field === "Site URL source")?.value, "GAMEFOUNDRY_SITE_URL");
      assert.equal(health.configurationSummary.rows.find((row) => row.field === "Storage projects prefix")?.value, "/local/projects/");
      assert.equal(JSON.stringify(health.configurationSummary).includes("site-user"), false);
      assert.equal(JSON.stringify(health.configurationSummary).includes("site-secret"), false);
      assert.equal(JSON.stringify(health.configurationSummary).includes("api-user"), false);
      assert.equal(JSON.stringify(health.configurationSummary).includes("api-secret"), false);
      assert.deepEqual(
        health.scheduledMonitoring.rows.map((row) => row.field),
        ["Last scheduled run", "Next scheduled run", "Duration", "Recent result", "Failures/warnings"],
      );
      assert.equal(health.scheduledMonitoring.rows.some((row) => row.value === "Not Configured"), true);
      assert.equal(health.scheduledMonitoring.status, "PENDING");
      assert.deepEqual(
        health.notificationsFoundation.rows.map((row) => row.field),
        ["Email alerts", "Admin notifications", "Webhook alerts", "Messages integration"],
      );
      assert.equal(health.notificationsFoundation.rows.every((row) => row.value === "Not Configured"), true);
      assert.equal(health.notificationsFoundation.status, "PENDING");
      assert.equal(health.environmentCapabilities.currentEnvironment, "Local");
      assert.equal(health.environmentCapabilities.peerEnvironmentChecks, false);
      assert.deepEqual(
        health.environmentCapabilities.rows.map((row) => row.capability),
        ["Hosting", "API", "Database", "Storage", "Authentication", "Scheduled Monitoring", "Notifications"],
      );
      assert.equal(JSON.stringify(health.environmentCapabilities).includes("/uat"), false);
      assert.equal(health.storageStatus.environmentFolder, "/local");
      assert.equal(typeof health.storageStatus.lastChecked, "string");
      assert.equal(Array.isArray(health.healthCheckHistory), true);
      assert.deepEqual(
        health.healthCheckHistory.slice(0, 4).map((row) => row.area),
        ["Environment Summary", "Database Health", "Storage Health", "Runtime Health"],
      );
      assert.equal(health.healthCheckHistory.every((row) => row.environmentName === "Local"), true);
      assert.equal(JSON.stringify(health.healthCheckHistory).includes("/dev"), false);
      assert.equal(JSON.stringify(health.healthCheckHistory).includes("/uat"), false);
      assert.deepEqual(
        health.environmentMap.map((row) => row.name),
        ["Local", "DEV", "IST", "UAT", "PRD"],
      );
      assert.equal(health.environmentComparison.noCrossEnvironmentChecks, true);
      assert.deepEqual(
        health.environmentComparison.rows.map((row) => row.displayName),
        ["Local (VS Code)", "DEV", "IST", "UAT", "PROD"],
      );
      assert.equal(health.environmentComparison.rows.filter((row) => row.activeCheck === true).length, 1);
      assert.equal(health.environmentComparison.rows.find((row) => row.displayName === "Local (VS Code)").state, "Current");
      assert.equal(health.environmentComparison.rows.find((row) => row.displayName === "DEV").state, "Not Configured");
      assert.equal(health.environmentComparison.rows.find((row) => row.displayName === "PROD").storageFolder, "/prd");
      assert.equal(health.apiContract.contractVersion, "2026-06-24.system-health.v1");
      assert.equal(health.apiContract.currentDeploymentOnly, true);
      assert.equal(health.apiContract.noCrossEnvironmentChecks, true);
      assert.equal(health.apiContract.referenceEnvironmentMapOnly, true);
      assert.deepEqual(
        health.apiContract.endpoints.map((endpoint) => `${endpoint.method} ${endpoint.path}`),
        [
          "GET /api/runtime/health",
          "GET /api/admin/system-health/status",
          "POST /api/admin/system-health/action",
          "POST /api/admin/system-health/storage-connectivity-action",
        ],
      );
      assert.deepEqual(
        health.adminApiRegistry.rows.map((row) => `${row.method} ${row.path}`),
        [
          "GET /api/runtime/health",
          "GET /api/admin/system-health/status",
          "POST /api/admin/system-health/action",
          "POST /api/admin/system-health/storage-connectivity-action",
          "GET /api/admin/infrastructure/storage-path-status",
          "POST /api/admin/infrastructure/storage-connectivity-action",
          "GET /api/admin/operations/status",
          "POST /api/admin/operations/action",
          "GET /api/navigation/admin-menu",
        ],
      );
      const runtimeJson = await apiJson(server.baseUrl, "/api/runtime/health");
      assert.equal(runtimeJson.environment.name, "Local");
      assert.equal(runtimeJson.api.status, "PASS");
      assert.ok(["PASS", "WARN", "FAIL"].includes(runtimeJson.database.status));
      assert.ok(["PASS", "WARN", "FAIL"].includes(runtimeJson.storage.status));
      assert.equal(typeof runtimeJson.timestamp, "string");
      assert.equal(runtimeJson.secretEditingAllowed, false);
      assert.equal(runtimeJson.secretsExposed, false);
      assert.equal(JSON.stringify(runtimeJson).includes("api-secret"), false);
      assert.equal(JSON.stringify(runtimeJson).includes("site-secret"), false);
      assert.deepEqual(
        health.runtimeFeatureFlags.rows.map((row) => `${row.flag}:${row.value}`),
        [
          "system-health.api-contract:Enabled",
          "system-health.environment-capabilities:Enabled",
          "system-health.admin-api-registry:Enabled",
          "system-health.runtime-health:Enabled",
          "system-health.manual-actions:Enabled",
          "system-health.scheduled-monitoring:Not Configured",
          "system-health.notifications:Not Configured",
        ],
      );
      assert.equal(
        health.environmentMap.some((row) => Object.prototype.hasOwnProperty.call(row, "status")),
        false,
      );
      assert.equal(health.localApiStartup.secretEditingAllowed, false);
      assert.equal(health.localApiStartup.secretsExposed, false);
      assert.equal(Array.isArray(health.localApiStartup.rows), true);
      assert.equal(
        health.localApiStartup.rows.some((row) => row.field === "Approved diagnostics format" && row.status === "PASS"),
        true,
      );
      assert.equal(
        health.localApiStartup.rows.some((row) => row.field === "Configurable multiple runtime ports" && row.status === "PASS" && row.value === "deprecated/superseded"),
        true,
      );
      const startupRows = new Map(health.localApiStartup.rows.map((row) => [row.field, row]));
      assert.equal(startupRows.get("Environment variable order")?.value, "alphabetical");
      assert.equal(startupRows.get("Secret masking markers")?.value, "PASSWORD, SECRET, TOKEN, KEY, SERVICE_ROLE, JWT");
      assert.equal(startupRows.get("Runtime configuration source")?.value, ".env + process environment");
      assert.equal(startupRows.get("Local API URL source")?.value, "GAMEFOUNDRY_API_URL");
      assert.equal(startupRows.get("Local site URL source")?.value, "GAMEFOUNDRY_SITE_URL");
      assert.equal(startupRows.get("Storage/R2 projects prefix source")?.value, "/local/projects/");
      assert.equal(startupRows.get("Local API URL")?.status, "PASS");
      assert.equal(startupRows.get("Configured API URL")?.status, "PASS");
      assert.equal(startupRows.get("Local site URL port")?.value, "5500");
      assert.ok(["Postgres", "not configured", "invalid database URL"].includes(startupRows.get("Database mode")?.value));
      assert.equal(startupRows.get("Storage status")?.value, "not configured");
      const startupText = JSON.stringify(health.localApiStartup);
      assert.equal(startupText.includes("api-user"), false);
      assert.equal(startupText.includes("api-secret"), false);
      assert.equal(startupText.includes("site-user"), false);
      assert.equal(startupText.includes("site-secret"), false);
      const runtimeAction = await apiJson(server.baseUrl, "/api/admin/system-health/action", {
        body: { actionId: "runtime-check" },
        method: "POST",
      });
      assert.equal(runtimeAction.runtimeHealth.environmentName, "Local");
      assert.equal(runtimeAction.actionId, "runtime-check");
      const databaseAction = await apiJson(server.baseUrl, "/api/admin/system-health/action", {
        body: { actionId: "database-check" },
        method: "POST",
      });
      assert.equal(databaseAction.databaseStatus.databaseType, "Local Docker PostgreSQL");
      assert.equal(databaseAction.actionId, "database-check");
      const storageAction = await apiJson(server.baseUrl, "/api/admin/system-health/action", {
        body: { actionId: "storage-check" },
        method: "POST",
      });
      assert.equal(storageAction.actionId, "storage-check");
      assert.deepEqual(
        storageAction.storageDiagnostics.map((row) => row.actionId),
        [
          "storage-bucket-connectivity",
          "storage-list",
          "storage-upload-test-object",
          "storage-read-test-object",
          "storage-delete-test-object",
        ],
      );
      assert.equal(storageAction.storageDiagnostics.every((row) => row.environmentFolder === "/local"), true);
      assert.equal(storageAction.permanentObjectCreated, false);
      assert.equal(typeof storageAction.validationDurationMs, "number");
      assert.equal(storageAction.storageDiagnostics.every((row) => typeof row.durationMs === "number"), true);
      assert.equal(storageAction.storageDiagnostics.every((row) => typeof row.operationLabel === "string"), true);
      assert.equal(storageAction.storageDiagnostics.every((row) => typeof row.cleanupStatus === "string"), true);
      assert.equal(storageAction.storageDiagnostics.every((row) => row.permanentObjectCreated === false), true);
      const refreshAction = await apiJson(server.baseUrl, "/api/admin/system-health/action", {
        body: { actionId: "refresh" },
        method: "POST",
      });
      assert.equal(refreshAction.statusSnapshot.environmentIdentity.name, "Local");
      const fullAction = await apiJson(server.baseUrl, "/api/admin/system-health/action", {
        body: { actionId: "full-health-check" },
        method: "POST",
      });
      assert.equal(fullAction.statusSnapshot.environmentIdentity.name, "Local");
      assert.equal(Array.isArray(health.operationsHealth.summaryRows), true);
      assert.deepEqual(
        health.operationsHealth.summaryRows.map((row) => row.area),
        [
          "Membership operations",
          "Invitation support",
          "AI credit monitoring",
          "Marketplace revenue health",
          "Team enforcement health",
          "Required DB configuration",
        ],
      );
      const healthText = JSON.stringify(health.operationsHealth);
      assert.equal(healthText.includes("monthlyPriceCents"), false);
      assert.equal(healthText.includes("priceCents"), false);
      assert.equal(JSON.stringify(health.postgresMetrics).includes("postgres://"), false);
      assert.equal(JSON.stringify(health.postgresMetrics).includes("postgresql://"), false);
      assert.equal(health.secretEditingAllowed, false);
    } finally {
      await server.close();
    }
  });
});

test("missing membership limits and AI credit packs produce visible operational issues", () => {
  const tables = createServerSeedTables();
  const studioPlan = tables.membership_plans.find((row) => row.code === "STUDIO");
  tables.membership_limits = tables.membership_limits.filter((row) => row.planKey !== studioPlan.key);
  tables.ai_credit_packs = tables.ai_credit_packs.filter((row) => row.code !== "LARGE");

  const health = adminOperationsHealth(tables);
  assert.equal(health.memberships.status, "FAIL");
  assert.equal(health.aiCredits.status, "FAIL");
  assert.equal(health.memberships.missingLimitPlanCodes.includes("STUDIO"), true);
  assert.equal(health.aiCredits.missingPackCodes.includes("LARGE"), true);
  assert.equal(health.configIssues.some((row) => /membership_limits row is missing for STUDIO/.test(row.issue)), true);
  assert.equal(health.configIssues.some((row) => /Required AI credit pack LARGE is missing/.test(row.issue)), true);
});

test("invitation status counts are accurate for Admin support", () => {
  const tables = createServerSeedTables();
  const betaPlan = tables.membership_plans.find((row) => row.code === "BETA");
  tables.invitations.push(
    {
      acceptedAt: "",
      acceptedBy: "",
      createdAt: "2026-06-18T12:00:00.000Z",
      createdBy: SEED_DB_KEYS.users.admin,
      email: "pending@example.invalid",
      expiresAt: "2026-07-18T12:00:00.000Z",
      invitationCode: "PENDING-001",
      invitedBy: SEED_DB_KEYS.users.admin,
      key: makeSeedUlid(12100),
      planKey: betaPlan.key,
      status: "pending",
      updatedAt: "2026-06-18T12:00:00.000Z",
      updatedBy: SEED_DB_KEYS.users.admin,
    },
    {
      acceptedAt: "2026-06-18T12:30:00.000Z",
      acceptedBy: SEED_DB_KEYS.users.user1,
      createdAt: "2026-06-18T12:10:00.000Z",
      createdBy: SEED_DB_KEYS.users.admin,
      email: "accepted@example.invalid",
      expiresAt: "2026-07-18T12:10:00.000Z",
      invitationCode: "ACCEPTED-001",
      invitedBy: SEED_DB_KEYS.users.admin,
      key: makeSeedUlid(12101),
      planKey: betaPlan.key,
      status: "accepted",
      updatedAt: "2026-06-18T12:30:00.000Z",
      updatedBy: SEED_DB_KEYS.users.user1,
    },
  );

  const health = adminOperationsHealth(tables);
  assert.equal(health.invitations.countsByStatus.pending, 1);
  assert.equal(health.invitations.countsByStatus.accepted, 1);
  assert.deepEqual(health.invitations.statusOptions, ["accepted", "pending"]);
});

test("AI usage summaries match ai_usage_log rows", () => {
  const tables = createServerSeedTables();
  assignUserMembership(tables, {
    externalSubscriptionId: "sub_admin_health_ai",
    planCode: "CREATOR",
    source: "paid",
    userKey: SEED_DB_KEYS.users.user1,
  }, options(12200));
  grantMonthlyAiCredits(tables, { userKey: SEED_DB_KEYS.users.user1 }, options(12300));
  debitAiCreditsForAction(tables, {
    actionCode: "TEXT_ASSIST",
    userKey: SEED_DB_KEYS.users.user1,
  }, options(12400));

  const health = adminOperationsHealth(tables);
  assert.equal(health.aiCredits.usageCount, tables.ai_usage_log.length);
  assert.equal(health.aiCredits.monthlyGrantCount, 1);
  assert.equal(health.aiCredits.debitCount, 1);
  assert.equal(health.aiCredits.rows.some((row) => row.actionCode === "TEXT_ASSIST" && row.creditDelta < 0), true);
  assert.equal(health.aiCredits.actionOptions.includes("TEXT_ASSIST"), true);
});

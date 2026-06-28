import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  applyTeamBootstrapEnvironment,
  formatBootstrapDiagnostics,
  loadEnvironmentFile,
  parseBootstrapArgs,
} from "../../bootstrap/start-dev.mjs";
import { resolveTeamPortConfig } from "../../bootstrap/team-port-config.mjs";

test("team-aware bootstrap resolves required team port mapping", () => {
  assert.deepEqual(
    ["owner", "default", "alpha", "bravo", "charlie", "gamma", "beta"].map((team) => {
      const config = resolveTeamPortConfig(team);
      return [team, config.team, config.webPort, config.apiPort, config.webUrl, config.apiUrl];
    }),
    [
      ["owner", "owner", 5500, 5501, "http://127.0.0.1:5500", "http://127.0.0.1:5501/api"],
      ["default", "owner", 5500, 5501, "http://127.0.0.1:5500", "http://127.0.0.1:5501/api"],
      ["alpha", "alpha", 5510, 5511, "http://127.0.0.1:5510", "http://127.0.0.1:5511/api"],
      ["bravo", "bravo", 5520, 5521, "http://127.0.0.1:5520", "http://127.0.0.1:5521/api"],
      ["charlie", "charlie", 5530, 5531, "http://127.0.0.1:5530", "http://127.0.0.1:5531/api"],
      ["gamma", "gamma", 5540, 5541, "http://127.0.0.1:5540", "http://127.0.0.1:5541/api"],
      ["beta", "beta", 5550, 5551, "http://127.0.0.1:5550", "http://127.0.0.1:5551/api"],
    ]
  );
});

test("team-aware bootstrap rejects unknown team names clearly", () => {
  assert.throws(
    () => resolveTeamPortConfig("omega"),
    /Unknown bootstrap team "omega"\. Use --team owner\|alpha\|bravo\|charlie\|gamma\|beta\|default\./
  );
});

test("bootstrap argument parser supports combined, API-only, web-only, team, and browser launch modes", () => {
  assert.deepEqual(parseBootstrapArgs([]), {
    openBrowser: false,
    startApi: true,
    startWeb: true,
    team: "owner",
  });
  assert.deepEqual(parseBootstrapArgs(["--team", "beta", "--api-only", "--open"]), {
    openBrowser: true,
    startApi: true,
    startWeb: false,
    team: "beta",
  });
  assert.deepEqual(parseBootstrapArgs(["--team=gamma", "--web-only"]), {
    openBrowser: false,
    startApi: false,
    startWeb: true,
    team: "gamma",
  });
  assert.throws(
    () => parseBootstrapArgs(["--no-api", "--no-web"]),
    /Bootstrap must start at least one process/
  );
});

test("bootstrap loads environment before applying team ports", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "gamefoundry-bootstrap-"));
  const envPath = path.join(tempRoot, ".env");
  await writeFile(envPath, [
    "GAMEFOUNDRY_SITE_URL=http://127.0.0.1:5500",
    "GAMEFOUNDRY_API_URL=http://127.0.0.1:5501/api",
    "EXISTING_VALUE=from-env-file",
    "",
  ].join("\n"), "utf8");

  try {
    const env = {};
    const envLoad = loadEnvironmentFile({ env, envFile: envPath });
    const config = resolveTeamPortConfig("charlie");
    applyTeamBootstrapEnvironment(env, config);

    assert.equal(envLoad.loaded, true);
    assert.deepEqual(envLoad.loadedKeys, [
      "GAMEFOUNDRY_SITE_URL",
      "GAMEFOUNDRY_API_URL",
      "EXISTING_VALUE",
    ]);
    assert.equal(env.EXISTING_VALUE, "from-env-file");
    assert.equal(env.GAMEFOUNDRY_LOCAL_API_HOST, "127.0.0.1");
    assert.equal(env.GAMEFOUNDRY_LOCAL_API_PORT, "5531");
    assert.equal(env.GAMEFOUNDRY_SITE_URL, "http://127.0.0.1:5530");
    assert.equal(env.GAMEFOUNDRY_API_URL, "http://127.0.0.1:5531/api");
  } finally {
    await rm(tempRoot, { force: true, recursive: true });
  }
});

test("bootstrap diagnostics include team, URLs, ports, and environment status", () => {
  const lines = formatBootstrapDiagnostics({
    envLoad: {
      loaded: true,
      loadedKeys: ["GAMEFOUNDRY_SITE_URL"],
      path: path.resolve(".env"),
    },
    openBrowser: true,
    startApi: true,
    startWeb: true,
    teamConfig: resolveTeamPortConfig("alpha"),
  });

  assert.deepEqual(lines, [
    "GameFoundry local bootstrap",
    "Team: alpha",
    "Web: enabled http://127.0.0.1:5510",
    "API: enabled http://127.0.0.1:5511/api",
    "Selected ports: web 5510, api 5511",
    "Environment: .env loaded (1 key(s) applied)",
    "Browser launch: enabled",
  ]);
});

test("package scripts expose team-aware bootstrap commands", async () => {
  const packageJson = JSON.parse(await readFile("package.json", "utf8"));
  assert.equal(packageJson.scripts["dev:bootstrap"], "node --use-system-ca ./dev/bootstrap/start-dev.mjs");
  assert.equal(packageJson.scripts["dev:local-api"], "node --use-system-ca ./dev/bootstrap/start-dev.mjs --api-only");
  assert.equal(packageJson.scripts["dev:api"], "node --use-system-ca ./dev/bootstrap/start-dev.mjs --api-only");
  assert.equal(packageJson.scripts["dev:web"], "node --use-system-ca ./dev/bootstrap/start-dev.mjs --web-only");
});

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  applyBootstrapEnvironment,
  formatBootstrapDiagnostics,
  loadRuntimeEnv,
  parseBootstrapOptions,
} from "../../scripts/start-dev.mjs";
import {
  parseRoleArgument,
  parseTeamArgument,
  resolveTeamPortConfig,
  supportedBootstrapRolesLabel,
  supportedBootstrapTeamsLabel,
} from "../../scripts/team-port-config.mjs";

const repoRoot = fileURLToPath(new URL("../../..", import.meta.url));

const BASE_PORTS = Object.freeze({
  owner: Object.freeze({ apiPort: 5501, webPort: 5500 }),
  alfa: Object.freeze({ apiPort: 5511, webPort: 5510 }),
  bravo: Object.freeze({ apiPort: 5521, webPort: 5520 }),
  charlie: Object.freeze({ apiPort: 5531, webPort: 5530 }),
  delta: Object.freeze({ apiPort: 5541, webPort: 5540 }),
  echo: Object.freeze({ apiPort: 5551, webPort: 5550 }),
  foxtrot: Object.freeze({ apiPort: 5561, webPort: 5560 }),
  golf: Object.freeze({ apiPort: 5571, webPort: 5570 }),
  hotel: Object.freeze({ apiPort: 5581, webPort: 5580 }),
});

test("team port config resolves owner role base ports", () => {
  Object.entries(BASE_PORTS).forEach(([team, ports]) => {
    assert.deepEqual(resolveTeamPortConfig({ team }), {
      apiPort: ports.apiPort,
      role: "owner",
      team,
      webPort: ports.webPort,
    });
  });
});

test("team port config resolves codex role ports as base ports plus two", () => {
  Object.entries(BASE_PORTS).forEach(([team, ports]) => {
    assert.deepEqual(resolveTeamPortConfig({ role: "codex", team }), {
      apiPort: ports.apiPort + 2,
      role: "codex",
      team,
      webPort: ports.webPort + 2,
    });
  });
});

test("team and role parsers accept canonical argument forms", () => {
  assert.equal(parseTeamArgument([]), "owner");
  assert.equal(parseTeamArgument(["--team", "alfa"]), "alfa");
  assert.equal(parseTeamArgument(["--team=bravo"]), "bravo");
  assert.equal(parseRoleArgument([]), "owner");
  assert.equal(parseRoleArgument(["--role", "codex"]), "codex");
  assert.equal(parseRoleArgument(["--role=owner"]), "owner");
});

test("invalid teams and roles fail with supported values", () => {
  assert.throws(
    () => resolveTeamPortConfig({ team: "omega" }),
    /Unknown bootstrap team "omega".*owner, alfa, bravo, charlie, delta, echo, foxtrot, golf, hotel/
  );
  assert.throws(
    () => resolveTeamPortConfig({ role: "reviewer", team: "alfa" }),
    /Unknown bootstrap role "reviewer".*owner, codex/
  );
  assert.throws(
    () => parseTeamArgument(["--team"]),
    /Missing bootstrap team after --team/
  );
  assert.throws(
    () => parseRoleArgument(["--role"]),
    /Missing bootstrap role after --role/
  );
});

test("bootstrap option parser maps npm script modes to server startup plan", () => {
  assert.deepEqual(parseBootstrapOptions(["--mode", "bootstrap", "--team", "alfa"]), {
    api: true,
    mode: "bootstrap",
    ports: {
      apiPort: 5511,
      role: "owner",
      team: "alfa",
      webPort: 5510,
    },
    role: "owner",
    team: "alfa",
    web: true,
  });
  assert.deepEqual(parseBootstrapOptions(["--mode=bootstrap", "--team=alfa", "--role=codex"]), {
    api: true,
    mode: "bootstrap",
    ports: {
      apiPort: 5513,
      role: "codex",
      team: "alfa",
      webPort: 5512,
    },
    role: "codex",
    team: "alfa",
    web: true,
  });
  assert.deepEqual(parseBootstrapOptions(["--mode=api", "--team=charlie", "--role=codex"]), {
    api: true,
    mode: "api",
    ports: {
      apiPort: 5533,
      role: "codex",
      team: "charlie",
      webPort: 5532,
    },
    role: "codex",
    team: "charlie",
    web: false,
  });
  assert.deepEqual(parseBootstrapOptions(["--mode=web", "--team=owner"]), {
    api: false,
    mode: "web",
    ports: {
      apiPort: 5501,
      role: "owner",
      team: "owner",
      webPort: 5500,
    },
    role: "owner",
    team: "owner",
    web: true,
  });
  assert.throws(
    () => parseBootstrapOptions(["--mode=deploy", "--team=alfa"]),
    /Unknown bootstrap mode "deploy"/
  );
});

test("bootstrap environment applies resolved team and role ports for browser API routing", () => {
  const env = {
    GAMEFOUNDRY_API_URL: "http://127.0.0.1:5501/api",
    GAMEFOUNDRY_SITE_URL: "http://127.0.0.1:5500",
  };
  applyBootstrapEnvironment({
    env,
    host: "127.0.0.1",
    ports: resolveTeamPortConfig({ role: "codex", team: "alfa" }),
  });

  assert.equal(env.GAMEFOUNDRY_LOCAL_API_HOST, "127.0.0.1");
  assert.equal(env.GAMEFOUNDRY_LOCAL_API_PORT, "5513");
  assert.equal(env.GAMEFOUNDRY_API_URL, "http://127.0.0.1:5513/api");
  assert.equal(env.GAMEFOUNDRY_SITE_URL, "http://127.0.0.1:5512");
});

test("startup diagnostics and package scripts expose team-aware bootstrap commands", () => {
  const lines = formatBootstrapDiagnostics({
    apiBaseUrl: "http://127.0.0.1:5513",
    mode: "bootstrap",
    role: "codex",
    runtimeEnv: {
      loaded: true,
      loadedKeys: 3,
    },
    team: "alfa",
    webBaseUrl: "http://127.0.0.1:5512",
  });

  assert.equal(lines.includes("Team: alfa"), true);
  assert.equal(lines.includes("Role: codex"), true);
  assert.equal(lines.includes("Web URL: http://127.0.0.1:5512"), true);
  assert.equal(lines.includes("API URL: http://127.0.0.1:5513/api"), true);
  assert.equal(lines.includes(`Supported teams: ${supportedBootstrapTeamsLabel()}`), true);
  assert.equal(lines.includes(`Supported roles: ${supportedBootstrapRolesLabel()}`), true);

  const packageJson = JSON.parse(readFileSync(`${repoRoot}/package.json`, "utf8"));
  assert.equal(packageJson.scripts["dev:bootstrap"], "node --use-system-ca ./dev/scripts/start-dev.mjs --mode bootstrap");
  assert.equal(packageJson.scripts["dev:api"], "node --use-system-ca ./dev/scripts/start-dev.mjs --mode api");
  assert.equal(packageJson.scripts["dev:web"], "node ./dev/scripts/start-dev.mjs --mode web");
  assert.equal(packageJson.scripts["dev:local-api"], "node --use-system-ca ./dev/scripts/start-local-api-server.mjs");
});

test("runtime env loader applies .env values without overriding existing process values", () => {
  const env = {
    GAMEFOUNDRY_API_URL: "http://127.0.0.1:5999/api",
  };
  const result = loadRuntimeEnv({
    cwd: repoRoot,
    env,
  });

  assert.equal(typeof result.loaded, "boolean");
  assert.equal(env.GAMEFOUNDRY_API_URL, "http://127.0.0.1:5999/api");
});

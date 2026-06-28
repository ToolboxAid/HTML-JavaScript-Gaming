import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  applyBootstrapEnvironment,
  formatBootstrapDiagnostics,
  launchBrowser,
  loadRuntimeEnv,
  parseBootstrapOptions,
  shouldLaunchBrowser,
  startBootstrapRuntime,
  teamIndexUrl,
} from "../../local-runtime/start-dev.mjs";
import {
  parseRoleArgument,
  parseTeamArgument,
  resolveTeamPortConfig,
  supportedBootstrapRolesLabel,
  supportedBootstrapTeamsLabel,
} from "../../local-runtime/team-port-config.mjs";

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
  assert.equal(parseTeamArgument(["--mode", "bootstrap", "charlie"]), "charlie");
  assert.equal(parseTeamArgument(["--mode=bootstrap", "charlie"]), "charlie");
  assert.equal(parseTeamArgument(["--mode", "bootstrap", "alfa", "codex"]), "alfa");
  assert.equal(parseTeamArgument(["--mode", "bootstrap", "codex", "alfa"]), "alfa");
  assert.equal(parseTeamArgument(["charlie", "--role", "codex"]), "charlie");
  assert.equal(parseRoleArgument([]), "owner");
  assert.equal(parseRoleArgument(["--role", "codex"]), "codex");
  assert.equal(parseRoleArgument(["--role=owner"]), "owner");
  assert.equal(parseRoleArgument(["--mode", "bootstrap", "alfa", "codex"]), "codex");
  assert.equal(parseRoleArgument(["--mode", "bootstrap", "codex", "alfa"]), "codex");
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
  assert.deepEqual(parseBootstrapOptions(["--mode", "bootstrap", "--team", "alfa", "--role", "codex"]), {
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
  assert.deepEqual(parseBootstrapOptions(["--mode", "bootstrap", "alfa", "codex"]), {
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
  assert.deepEqual(parseBootstrapOptions(["--mode", "bootstrap", "charlie"]), {
    api: true,
    mode: "bootstrap",
    ports: {
      apiPort: 5531,
      role: "owner",
      team: "charlie",
      webPort: 5530,
    },
    role: "owner",
    team: "charlie",
    web: true,
  });
  assert.deepEqual(parseBootstrapOptions(["--mode", "bootstrap", "--team", "bravo"]), {
    api: true,
    mode: "bootstrap",
    ports: {
      apiPort: 5521,
      role: "owner",
      team: "bravo",
      webPort: 5520,
    },
    role: "owner",
    team: "bravo",
    web: true,
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

test("bootstrap environment overrides legacy env URLs with resolved team and role ports", () => {
  const env = {
    GAMEFOUNDRY_LOCAL_API_HOST: "0.0.0.0",
    GAMEFOUNDRY_API_URL: "http://127.0.0.1:5501/api",
    GAMEFOUNDRY_LOCAL_API_PORT: "5501",
    GAMEFOUNDRY_SITE_URL: "http://127.0.0.1:5500",
  };
  applyBootstrapEnvironment({
    env,
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
    browserLaunch: {
      enabled: false,
      reason: "skipped for codex role",
      url: "http://127.0.0.1:5512/index.html",
    },
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
  assert.equal(lines.includes("Browser launch: skipped for codex role"), true);
  assert.equal(lines.includes(`Supported teams: ${supportedBootstrapTeamsLabel()}`), true);
  assert.equal(lines.includes(`Supported roles: ${supportedBootstrapRolesLabel()}`), true);

  const packageJson = JSON.parse(readFileSync(`${repoRoot}/package.json`, "utf8"));
  assert.equal(packageJson.scripts["dev:bootstrap"], "node --use-system-ca ./dev/local-runtime/start-dev.mjs --mode bootstrap");
  assert.equal(packageJson.scripts["dev:api"], "node --use-system-ca ./dev/local-runtime/start-dev.mjs --mode api");
  assert.equal(packageJson.scripts["dev:web"], "node ./dev/local-runtime/start-dev.mjs --mode web");
  assert.equal(packageJson.scripts["dev:local-api"], "node --use-system-ca ./dev/local-runtime/start-local-api-server.mjs");
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

test("browser launch targets team index after API and web servers are ready for bravo owner role", async () => {
  const events = [];
  const env = {
    GAMEFOUNDRY_LOCAL_API_HOST: "0.0.0.0",
    GAMEFOUNDRY_API_URL: "http://127.0.0.1:5501/api",
    GAMEFOUNDRY_SITE_URL: "http://127.0.0.1:5500",
  };
  const runtime = await startBootstrapRuntime(
    parseBootstrapOptions(["--mode=bootstrap", "--team=bravo"]),
    {
      apiServerStarter: async ({ port }) => {
        events.push(`api:${port}`);
        return {
          close: async () => events.push("api:closed"),
        };
      },
      browserLauncher: (url) => {
        events.push(`browser:${url}`);
        return {
          enabled: true,
          url,
        };
      },
      env,
      loadEnv: () => ({
        loaded: false,
        loadedKeys: 0,
      }),
      webServerStarter: async ({ port }) => {
        events.push(`web:${port}`);
        return {
          close: async () => events.push("web:closed"),
        };
      },
    },
  );

  assert.deepEqual(events, [
    "api:5521",
    "web:5520",
    "browser:http://127.0.0.1:5520/index.html",
  ]);
  assert.equal(env.GAMEFOUNDRY_LOCAL_API_HOST, "127.0.0.1");
  assert.equal(env.GAMEFOUNDRY_API_URL, "http://127.0.0.1:5521/api");
  assert.equal(env.GAMEFOUNDRY_SITE_URL, "http://127.0.0.1:5520");
  assert.equal(runtime.diagnostics.includes("Browser launch: http://127.0.0.1:5520/index.html"), true);
  await runtime.close();
  assert.deepEqual(events.slice(-2), ["api:closed", "web:closed"]);
});

test("alfa codex role skips browser launch even after API and web servers are ready", async () => {
  const events = [];
  const env = {};
  const runtime = await startBootstrapRuntime(
    parseBootstrapOptions(["--mode=bootstrap", "--team", "alfa", "--role", "codex"]),
    {
      apiServerStarter: async ({ port }) => {
        events.push(`api:${port}`);
        return {
          close: async () => {},
        };
      },
      browserLauncher: (url) => {
        events.push(`browser:${url}`);
        return {
          enabled: true,
          url,
        };
      },
      env,
      loadEnv: () => ({
        loaded: false,
        loadedKeys: 0,
      }),
      webServerStarter: async ({ port }) => {
        events.push(`web:${port}`);
        return {
          close: async () => {},
        };
      },
    },
  );

  assert.deepEqual(events, ["api:5513", "web:5512"]);
  assert.equal(env.GAMEFOUNDRY_API_URL, "http://127.0.0.1:5513/api");
  assert.equal(env.GAMEFOUNDRY_SITE_URL, "http://127.0.0.1:5512");
  assert.equal(runtime.diagnostics.includes("Browser launch: skipped for codex role"), true);
  await runtime.close();
});

test("browser launch helper uses platform conventions and team index URLs", () => {
  const launches = [];
  const result = launchBrowser(teamIndexUrl("http://127.0.0.1:5510/"), {
    platform: "win32",
    spawnFn: (command, args, options) => {
      launches.push({ args, command, options });
      return {
        unref: () => launches.push({ unref: true }),
      };
    },
  });

  assert.deepEqual(result, {
    args: ["/c", "start", "", "http://127.0.0.1:5510/index.html"],
    command: "cmd",
    enabled: true,
    url: "http://127.0.0.1:5510/index.html",
  });
  assert.equal(launches[0].options.detached, true);
  assert.equal(launches[0].options.stdio, "ignore");
  assert.deepEqual(launches[1], { unref: true });
});

test("browser launch policy only opens for owner role when API and web are both active", () => {
  assert.equal(shouldLaunchBrowser(parseBootstrapOptions(["--mode=bootstrap", "--team=alfa"])), true);
  assert.equal(shouldLaunchBrowser(parseBootstrapOptions(["--mode=bootstrap", "--team=alfa", "--role=codex"])), false);
  assert.equal(shouldLaunchBrowser(parseBootstrapOptions(["--mode=api", "--team=alfa"])), false);
  assert.equal(shouldLaunchBrowser(parseBootstrapOptions(["--mode=web", "--team=alfa"])), false);
});

import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";

const repoRoot = path.resolve(import.meta.dirname, "..", "..");

function readRepoFile(filePath) {
  return readFileSync(path.join(repoRoot, filePath), "utf8");
}

function importRegistryClient(label) {
  return import(`../../../www/toolbox/tool-registry-api-client.js?contract=${label}-${Date.now()}-${Math.random()}`);
}

class RegistrySnapshotXhr {
  constructor() {
    this.headers = {};
    this.method = "";
    this.status = 0;
    this.url = "";
    this.responseText = "";
  }

  open(method, url) {
    this.method = method;
    this.url = url;
  }

  setRequestHeader(name, value) {
    this.headers[name] = value;
  }

  send() {
    assert.equal(this.method, "GET");
    assert.equal(this.url, "/api/toolbox/registry/snapshot");
    this.status = 200;
    this.responseText = JSON.stringify({
      data: {
        activeTools: [{
          displayName: "Contract Tool",
          id: "contract-tool",
          imageSources: {
            badge: "/assets/theme-v2/images/badges/contract-tool.png",
            tool: "/assets/theme-v2/images/tools/contract-tool.png",
          },
          route: "www/toolbox/contract-tool/index.html",
        }],
        imageFallback: "/should-not-own-product-data.svg",
        readinessByStatus: { beta: "Yes" },
        toolboxContract: { releaseChannels: ["beta"] },
        tools: [{
          displayName: "Contract Tool",
          id: "contract-tool",
          imageSources: {
            badge: "/assets/theme-v2/images/badges/contract-tool.png",
            tool: "/assets/theme-v2/images/tools/contract-tool.png",
          },
          route: "www/toolbox/contract-tool/index.html",
        }],
      },
      ok: true,
    });
  }
}

test("Toolbox registry browser client fails visibly instead of synthesizing product data", async () => {
  const previousXhr = globalThis.XMLHttpRequest;
  delete globalThis.XMLHttpRequest;
  try {
    const registry = await importRegistryClient("missing-api");
    assert.match(registry.getToolRegistryApiDiagnostic(), /browser XMLHttpRequest runtime/);
    assert.throws(() => registry.getToolRegistry(), /browser XMLHttpRequest runtime/);
    assert.throws(() => registry.getActiveToolRegistry(), /browser XMLHttpRequest runtime/);
    assert.equal(registry.TOOL_IMAGE_FALLBACK, "/assets/theme-v2/images/image-missing.svg");
  } finally {
    if (previousXhr === undefined) {
      delete globalThis.XMLHttpRequest;
    } else {
      globalThis.XMLHttpRequest = previousXhr;
    }
  }
});

test("Toolbox registry browser client consumes server API snapshot when available", async () => {
  const previousXhr = globalThis.XMLHttpRequest;
  globalThis.XMLHttpRequest = RegistrySnapshotXhr;
  try {
    const registry = await importRegistryClient("server-api");
    assert.equal(registry.getToolRegistryApiDiagnostic(), "");
    assert.deepEqual(registry.getToolRegistry().map((tool) => tool.id), ["contract-tool"]);
    assert.deepEqual(registry.getActiveToolRegistry().map((tool) => tool.id), ["contract-tool"]);
    assert.deepEqual(registry.getToolboxContract(), { releaseChannels: ["beta"] });
    assert.equal(registry.getToolProgressReadiness("beta"), "Yes");
    assert.equal(registry.getToolImageSource(registry.getToolById("contract-tool"), "badge"), "/assets/theme-v2/images/badges/contract-tool.png");
    assert.equal(registry.getToolImageSource(null, "badge"), "/assets/theme-v2/images/image-missing.svg");
  } finally {
    if (previousXhr === undefined) {
      delete globalThis.XMLHttpRequest;
    } else {
      globalThis.XMLHttpRequest = previousXhr;
    }
  }
});

test("Active browser product-data entrypoints use API or service clients", () => {
  const registryClient = readRepoFile("www/toolbox/tool-registry-api-client.js");
  assert.doesNotMatch(registryClient, /activeTools:\s*\[\]/);
  assert.doesNotMatch(registryClient, /tools:\s*\[\]/);

  const productApiClients = [
    "assets/js/shared/assets-api-client.js",
    "assets/toolbox/colors/js/index.js",
    "assets/js/shared/controls-api-client.js",
    "assets/toolbox/game-configuration/js/index.js",
    "assets/toolbox/game-design/js/index.js",
    "assets/js/shared/game-journey-api-client.js",
    "www/toolbox/game-hub/game-hub-api-client.js",
    "assets/toolbox/objects/js/index.js",
    "assets/toolbox/tags/js/index.js",
  ];
  productApiClients.forEach((filePath) => {
    assert.equal(existsSync(path.join(repoRoot, filePath)), true, `${filePath} missing`);
    const contents = readRepoFile(filePath);
    assert.match(contents, /createServerRepositoryClient/, `${filePath} must use the server repository contract`);
    assert.match(contents, /readServerToolConstants/, `${filePath} must use server-owned constants`);
  });

  assert.match(readRepoFile("admin/tool-votes.js"), /src\/engine\/api\/toolbox-votes-api-client\.js/);
  assert.match(readRepoFile("www/toolbox/tools-page-accordions.js"), /src\/engine\/api\/toolbox-votes-api-client\.js/);
  assert.match(readRepoFile("assets/theme-v2/js/account-achievements.js"), /createServerRepositoryClient\("game-hub"\)/);

  [
    "admin/tool-votes.js",
    "assets/theme-v2/js/account-achievements.js",
    "www/toolbox/tools-page-accordions.js",
    ...productApiClients,
  ].forEach((filePath) => {
    const contents = readRepoFile(filePath);
    assert.doesNotMatch(contents, /src\/dev-runtime\//, `${filePath} must not import dev-runtime directly`);
    assert.doesNotMatch(contents, /src\/engine\/persistence\//, `${filePath} must not import persistence directly`);
  });
});

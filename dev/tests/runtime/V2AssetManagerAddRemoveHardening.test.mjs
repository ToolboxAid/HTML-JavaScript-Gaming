import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..", "..");
const toolPath = path.join(repoRoot, "www", "toolbox", "asset-manager-v2", "index.js");
const resultsPath = path.join(repoRoot, "dev", "workspace", "tmp", "pr_11_316_asset_manager_add_remove_results.json");

function checkSyntax(filePath) {
  execFileSync(process.execPath, ["--check", filePath], {
    cwd: repoRoot,
    stdio: ["ignore", "pipe", "pipe"]
  });
}

function createElementRecord(id = "") {
  return {
    id,
    value: "",
    textContent: "",
    hidden: false,
    type: "",
    children: [],
    listeners: {},
    append(...nodes) {
      this.children.push(...nodes);
    },
    appendChild(node) {
      this.children.push(node);
      return node;
    },
    replaceChildren(...nodes) {
      this.children = [...nodes];
    },
    addEventListener(eventName, handler) {
      this.listeners[eventName] = handler;
    },
    click() {
      if (typeof this.listeners.click === "function") {
        this.listeners.click();
      }
    }
  };
}

function createHarness() {
  const elementRecords = new Map();
  const storage = new Map();
  const validSession = {
    version: "v2",
    toolId: "asset-manager-v2",
    payloadJson: {
      assetCatalog: {
        name: "Catalog",
        entries: [
          { id: "ship-1", label: "Ship", kind: "svg", path: "assets/ship.svg" }
        ]
      }
    }
  };
  storage.set("ctx-1", JSON.stringify(validSession));

  const document = {
    title: "",
    body: {
      dataset: {}
    },
    getElementById(id) {
      if (!elementRecords.has(id)) {
        elementRecords.set(id, createElementRecord(id));
      }
      return elementRecords.get(id);
    },
    createElement(tagName) {
      const element = createElementRecord(tagName);
      element.tagName = tagName;
      return element;
    }
  };

  const window = {
    location: {
      href: "https://example.test/toolbox/asset-manager-v2/index.html?hostContextId=ctx-1"
    },
    addEventListener() {},
    sessionStorage: {
      getItem(key) {
        return storage.has(key) ? storage.get(key) : null;
      },
      setItem(key, value) {
        storage.set(key, String(value));
      }
    }
  };

  const context = vm.createContext({
    window,
    document,
    URL,
    JSON,
    Error,
    console: { log() {}, error() {} }
  });

  const rawSource = fs.readFileSync(toolPath, "utf8");
  const classSource = rawSource.replace(/\nnew AssetBrowserV2\(\);\s*$/u, "\n");
  vm.runInContext(`${classSource}\nthis.AssetBrowserV2 = AssetBrowserV2;`, context);
  const instance = new context.AssetBrowserV2();

  return { instance, elementRecords, storage, rawSource };
}

function setFormValues(elementRecords, values) {
  if (!elementRecords.has("assetManagerV2AddId")) elementRecords.set("assetManagerV2AddId", createElementRecord("assetManagerV2AddId"));
  if (!elementRecords.has("assetManagerV2AddLabel")) elementRecords.set("assetManagerV2AddLabel", createElementRecord("assetManagerV2AddLabel"));
  if (!elementRecords.has("assetManagerV2AddKind")) elementRecords.set("assetManagerV2AddKind", createElementRecord("assetManagerV2AddKind"));
  if (!elementRecords.has("assetManagerV2AddPath")) elementRecords.set("assetManagerV2AddPath", createElementRecord("assetManagerV2AddPath"));
  elementRecords.get("assetManagerV2AddId").value = values.id;
  elementRecords.get("assetManagerV2AddLabel").value = values.label;
  elementRecords.get("assetManagerV2AddKind").value = values.kind;
  elementRecords.get("assetManagerV2AddPath").value = values.path;
}

export function run() {
  checkSyntax(toolPath);
  const { instance, elementRecords, storage, rawSource } = createHarness();
  if (!elementRecords.has("assetManagerV2ActionStatus")) {
    elementRecords.set("assetManagerV2ActionStatus", createElementRecord("assetManagerV2ActionStatus"));
  }
  const actionStatus = elementRecords.get("assetManagerV2ActionStatus");
  const hostContextId = "ctx-1";

  setFormValues(elementRecords, {
    id: "dup-asset",
    label: "Duplicate",
    kind: "png",
    path: "assets/duplicate.png"
  });
  instance.addAssetEntry();
  const afterFirstAdd = JSON.parse(storage.get(hostContextId));
  setFormValues(elementRecords, {
    id: "dup-asset",
    label: "Duplicate Again",
    kind: "png",
    path: "assets/duplicate-again.png"
  });
  instance.addAssetEntry();
  const duplicateMessage = actionStatus.textContent;
  const afterDuplicateAttempt = JSON.parse(storage.get(hostContextId));

  setFormValues(elementRecords, {
    id: "   ",
    label: "Label",
    kind: "svg",
    path: "assets/x.svg"
  });
  instance.addAssetEntry();
  const whitespaceMessage = actionStatus.textContent;
  const afterWhitespaceAttempt = JSON.parse(storage.get(hostContextId));

  instance.removeAssetEntryById("missing-asset-id");
  const missingRemoveMessage = actionStatus.textContent;
  const afterMissingRemoveAttempt = JSON.parse(storage.get(hostContextId));

  setFormValues(elementRecords, {
    id: "new-asset",
    label: "New Asset",
    kind: "png",
    path: "assets/new.png"
  });
  instance.addAssetEntry();
  const afterValidAdd = JSON.parse(storage.get(hostContextId));

  instance.removeAssetEntryById("new-asset");
  const afterValidRemove = JSON.parse(storage.get(hostContextId));

  const summary = {
    generatedAt: new Date().toISOString(),
    checks: {
      duplicateIdRejected: duplicateMessage === "Add blocked. Asset id 'dup-asset' already exists.",
      duplicateIdDidNotMutateEntries: afterDuplicateAttempt.payloadJson.assetCatalog.entries.length === afterFirstAdd.payloadJson.assetCatalog.entries.length,
      whitespaceOnlyFieldRejected: whitespaceMessage === "Add blocked. Missing required field(s): id.",
      whitespaceRejectDidNotMutateEntries: afterWhitespaceAttempt.payloadJson.assetCatalog.entries.length === afterDuplicateAttempt.payloadJson.assetCatalog.entries.length,
      removeMissingIdRejected: missingRemoveMessage === "Remove blocked. Asset id 'missing-asset-id' was not found.",
      removeMissingDidNotMutateEntries: afterMissingRemoveAttempt.payloadJson.assetCatalog.entries.length === afterWhitespaceAttempt.payloadJson.assetCatalog.entries.length,
      validAddStillPersists: afterValidAdd.payloadJson.assetCatalog.entries.some((entry) => entry.id === "new-asset"),
      validRemoveStillPersists: !afterValidRemove.payloadJson.assetCatalog.entries.some((entry) => entry.id === "new-asset"),
      hasNoWhitespaceFallbackPath: !rawSource.includes("payloadJson: {}")
    }
  };

  fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
  fs.writeFileSync(resultsPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  for (const [key, value] of Object.entries(summary.checks)) {
    assert.equal(value, true, `${key} failed`);
  }

  return summary;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const summary = run();
    console.log(JSON.stringify(summary, null, 2));
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}

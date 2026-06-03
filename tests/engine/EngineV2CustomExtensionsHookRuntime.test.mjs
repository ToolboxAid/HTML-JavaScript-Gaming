/*
Toolbox Aid
David Quesenberry
06/03/2026
EngineV2CustomExtensionsHookRuntime.test.mjs
*/

import assert from "node:assert/strict";
import fs from "node:fs";
import {
  ENGINE_V2_CUSTOM_EXTENSION_ERRORS,
  ENGINE_V2_CUSTOM_EXTENSION_HOOK_LIST,
  dispatchEngineV2CustomExtensionHook,
  registerEngineV2CustomExtensionHooks,
} from "../../src/engine/runtime/engineV2CustomExtensionsHookRuntime.js";

function createExtensionDefinition(overrides = {}) {
  return {
    extensionId: "custom-extension.approved",
    displayName: "Custom Extensions Weather Polish",
    approvalStatus: "approved",
    requestedCapabilities: [],
    hookRegistrations: ENGINE_V2_CUSTOM_EXTENSION_HOOK_LIST.map((hookName) => ({
      hookName,
      extensionMode: "enhance",
      allowedContextKeys: ["projectId", "sceneId", "deltaMs", "metadata"],
      requestedCapabilities: [],
    })),
    ...overrides,
  };
}

export function run() {
  const approvedExtension = createExtensionDefinition();
  const privateExtension = createExtensionDefinition({
    extensionId: "custom-extension.private",
    displayName: "Creator Private Custom Extension",
    approvalStatus: "unapproved",
    hookRegistrations: [
      {
        hookName: "onTick",
        extensionMode: "enhance",
        allowedContextKeys: ["sceneId", "deltaMs", "runtimeStateSummary"],
        requestedCapabilities: [],
      },
    ],
  });
  const registrationResult = registerEngineV2CustomExtensionHooks({
    extensionDefinitions: [approvedExtension, privateExtension],
  });

  assert.equal(registrationResult.valid, true);
  assert.equal(registrationResult.registeredHooks.length, 8);
  assert.deepEqual(new Set(registrationResult.registeredHooks.map((hook) => hook.hookName)), new Set(ENGINE_V2_CUSTOM_EXTENSION_HOOK_LIST));
  assert.equal(registrationResult.publishEligibility.eligible, false);
  assert.deepEqual(registrationResult.publishEligibility.blockedByExtensionIds, ["custom-extension.private"]);
  assert.equal(registrationResult.registeredHooks.find((hook) => hook.extensionId === "custom-extension.private").creatorPrivate, true);
  assert.equal(registrationResult.registeredHooks.find((hook) => hook.extensionId === "custom-extension.private").publishEligible, false);

  const dispatchResult = dispatchEngineV2CustomExtensionHook({
    runtime: registrationResult.runtime,
    hookName: "onTick",
    runtimeContext: {
      projectId: "project.engine-v2",
      sceneId: "scene.start",
      deltaMs: 16,
      runtimeStateSummary: { objectCount: 3 },
      metadata: { lane: "engine-v2" },
      window: "forbidden",
      document: "forbidden",
      localStorage: "forbidden",
      engineInternals: { secret: true },
    },
  });

  assert.equal(dispatchResult.valid, true);
  assert.equal(dispatchResult.hookInvocations.length, 2);
  dispatchResult.hookInvocations.forEach((invocation) => {
    assert.equal(Object.hasOwn(invocation.context, "window"), false);
    assert.equal(Object.hasOwn(invocation.context, "document"), false);
    assert.equal(Object.hasOwn(invocation.context, "localStorage"), false);
    assert.equal(Object.hasOwn(invocation.context, "engineInternals"), false);
  });
  assert.deepEqual(dispatchResult.hookInvocations.find((invocation) => invocation.extensionId === "custom-extension.private").context, {
    sceneId: "scene.start",
    deltaMs: 16,
    runtimeStateSummary: { objectCount: 3 },
  });

  const invalidHookResult = registerEngineV2CustomExtensionHooks({
    extensionDefinitions: [
      createExtensionDefinition({
        hookRegistrations: [{ hookName: "onReplaceEngine", extensionMode: "enhance", allowedContextKeys: ["sceneId"] }],
      }),
    ],
  });

  assert.equal(invalidHookResult.valid, false);
  assert.deepEqual(invalidHookResult.errors.map((error) => error.code), [ENGINE_V2_CUSTOM_EXTENSION_ERRORS.HOOK_INVALID]);

  const replaceModeResult = registerEngineV2CustomExtensionHooks({
    extensionDefinitions: [
      createExtensionDefinition({
        hookRegistrations: [{ hookName: "onTick", extensionMode: "replace", allowedContextKeys: ["sceneId"] }],
      }),
    ],
  });

  assert.equal(replaceModeResult.valid, false);
  assert.deepEqual(replaceModeResult.errors.map((error) => error.code), [ENGINE_V2_CUSTOM_EXTENSION_ERRORS.MODE_INVALID]);

  const forbiddenCapabilityResult = registerEngineV2CustomExtensionHooks({
    extensionDefinitions: [createExtensionDefinition({ requestedCapabilities: ["window"] })],
  });

  assert.equal(forbiddenCapabilityResult.valid, false);
  assert.deepEqual(forbiddenCapabilityResult.errors.map((error) => error.code), [ENGINE_V2_CUSTOM_EXTENSION_ERRORS.CAPABILITY_FORBIDDEN]);

  const sourceFieldResult = registerEngineV2CustomExtensionHooks({
    extensionDefinitions: [createExtensionDefinition({ sourceCode: "console.log('blocked')" })],
  });

  assert.equal(sourceFieldResult.valid, false);
  assert.deepEqual(sourceFieldResult.errors.map((error) => error.code), [ENGINE_V2_CUSTOM_EXTENSION_ERRORS.FIELD_FORBIDDEN]);

  const runtimeSource = fs.readFileSync("src/engine/runtime/engineV2CustomExtensionsHookRuntime.js", "utf8");
  assert.equal(/\beval\s*\(/.test(runtimeSource), false);
  assert.equal(/\bnew\s+Function\b/.test(runtimeSource), false);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}

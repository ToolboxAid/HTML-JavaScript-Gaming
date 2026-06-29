/*
Toolbox Aid
David Quesenberry
06/03/2026
EngineV2CustomExtensionsHookRuntime.test.mjs
*/

import assert from "node:assert/strict";
import fs from "node:fs";
import {
  ENGINE_V2_ADMIN_CUSTOM_EXTENSION_APPROVAL_ACTIONS,
  ENGINE_V2_CUSTOM_EXTENSION_APPROVAL_STATUS,
  ENGINE_V2_CUSTOM_EXTENSION_ERRORS,
  ENGINE_V2_CUSTOM_EXTENSION_HOOK_LIST,
  dispatchEngineV2CustomExtensionHook,
  registerEngineV2CustomExtensionHooks,
  resolveEngineV2AdminCustomExtensionApprovalBoundary,
} from "../../../www/src/engine/runtime/engineV2CustomExtensionsHookRuntime.js";

function createExtensionDefinition(overrides = {}) {
  return {
    extensionId: "custom-extension.approved",
    displayName: "Custom Extensions Weather Polish",
    approvalStatus: ENGINE_V2_CUSTOM_EXTENSION_APPROVAL_STATUS.HUMAN_APPROVED,
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
  assert.deepEqual(new Set(Object.values(ENGINE_V2_CUSTOM_EXTENSION_APPROVAL_STATUS)), new Set([
    "draft",
    "private",
    "submitted",
    "aiValidated",
    "aiRejected",
    "humanApproved",
    "humanRejected",
    "promotedCandidate",
  ]));

  const approvedExtension = createExtensionDefinition();
  const privateExtension = createExtensionDefinition({
    extensionId: "custom-extension.private",
    displayName: "Creator Private Custom Extension",
    approvalStatus: ENGINE_V2_CUSTOM_EXTENSION_APPROVAL_STATUS.PRIVATE,
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
  assert.equal(registrationResult.publishEligibility.humanApprovalRequired, true);
  assert.equal(registrationResult.registeredHooks.find((hook) => hook.extensionId === "custom-extension.approved").humanApproved, true);
  assert.equal(registrationResult.registeredHooks.find((hook) => hook.extensionId === "custom-extension.private").creatorPrivate, true);
  assert.equal(registrationResult.registeredHooks.find((hook) => hook.extensionId === "custom-extension.private").humanApprovalRequiredForPublishEligibility, true);
  assert.equal(registrationResult.registeredHooks.find((hook) => hook.extensionId === "custom-extension.private").publishEligible, false);

  const aiValidatedExtension = createExtensionDefinition({
    extensionId: "custom-extension.ai-validated",
    displayName: "AI Validated Advisory Custom Extension",
    approvalStatus: ENGINE_V2_CUSTOM_EXTENSION_APPROVAL_STATUS.AI_VALIDATED,
    hookRegistrations: [
      {
        hookName: "onAction",
        extensionMode: "enhance",
        allowedContextKeys: ["projectId", "sceneId", "action"],
        requestedCapabilities: [],
      },
    ],
  });
  const aiValidatedRegistration = registerEngineV2CustomExtensionHooks({
    extensionDefinitions: [aiValidatedExtension],
  });

  assert.equal(aiValidatedRegistration.valid, true);
  assert.equal(aiValidatedRegistration.publishEligibility.eligible, false);
  assert.deepEqual(aiValidatedRegistration.publishEligibility.blockedByExtensionIds, ["custom-extension.ai-validated"]);
  assert.equal(aiValidatedRegistration.registeredHooks[0].aiValidationAdvisory, true);
  assert.equal(aiValidatedRegistration.registeredHooks[0].creatorPrivate, true);
  assert.equal(aiValidatedRegistration.registeredHooks[0].publishEligible, false);

  const aiBoundaryResult = resolveEngineV2AdminCustomExtensionApprovalBoundary({
    extensionDefinition: createExtensionDefinition({
      extensionId: "custom-extension.submitted",
      approvalStatus: ENGINE_V2_CUSTOM_EXTENSION_APPROVAL_STATUS.SUBMITTED,
    }),
    approvalAction: { actionType: ENGINE_V2_ADMIN_CUSTOM_EXTENSION_APPROVAL_ACTIONS.RECORD_AI_VALIDATED },
  });

  assert.equal(aiBoundaryResult.valid, true);
  assert.equal(aiBoundaryResult.nextApprovalStatus, ENGINE_V2_CUSTOM_EXTENSION_APPROVAL_STATUS.AI_VALIDATED);
  assert.equal(aiBoundaryResult.aiValidationAdvisory, true);
  assert.equal(aiBoundaryResult.publishEligibility.eligible, false);
  assert.equal(aiBoundaryResult.publishEligibility.humanApprovalRequired, true);

  const promotedBoundaryResult = resolveEngineV2AdminCustomExtensionApprovalBoundary({
    extensionDefinition: createExtensionDefinition({
      extensionId: "custom-extension.candidate",
      approvalStatus: ENGINE_V2_CUSTOM_EXTENSION_APPROVAL_STATUS.AI_VALIDATED,
    }),
    approvalAction: { actionType: ENGINE_V2_ADMIN_CUSTOM_EXTENSION_APPROVAL_ACTIONS.PROMOTE_CANDIDATE },
  });

  assert.equal(promotedBoundaryResult.valid, true);
  assert.equal(promotedBoundaryResult.nextApprovalStatus, ENGINE_V2_CUSTOM_EXTENSION_APPROVAL_STATUS.PROMOTED_CANDIDATE);
  assert.equal(promotedBoundaryResult.publishEligibility.eligible, false);
  assert.equal(promotedBoundaryResult.creatorPrivate, true);

  const humanApprovalBoundaryResult = resolveEngineV2AdminCustomExtensionApprovalBoundary({
    extensionDefinition: createExtensionDefinition({
      extensionId: "custom-extension.candidate",
      approvalStatus: ENGINE_V2_CUSTOM_EXTENSION_APPROVAL_STATUS.PROMOTED_CANDIDATE,
    }),
    approvalAction: { actionType: ENGINE_V2_ADMIN_CUSTOM_EXTENSION_APPROVAL_ACTIONS.HUMAN_APPROVE },
  });

  assert.equal(humanApprovalBoundaryResult.valid, true);
  assert.equal(humanApprovalBoundaryResult.nextApprovalStatus, ENGINE_V2_CUSTOM_EXTENSION_APPROVAL_STATUS.HUMAN_APPROVED);
  assert.equal(humanApprovalBoundaryResult.publishEligibility.eligible, true);
  assert.equal(humanApprovalBoundaryResult.creatorPrivate, false);

  const invalidApprovalTransition = resolveEngineV2AdminCustomExtensionApprovalBoundary({
    extensionDefinition: createExtensionDefinition({
      approvalStatus: ENGINE_V2_CUSTOM_EXTENSION_APPROVAL_STATUS.PRIVATE,
    }),
    approvalAction: { actionType: ENGINE_V2_ADMIN_CUSTOM_EXTENSION_APPROVAL_ACTIONS.HUMAN_APPROVE },
  });

  assert.equal(invalidApprovalTransition.valid, false);
  assert.deepEqual(invalidApprovalTransition.errors.map((error) => error.code), [ENGINE_V2_CUSTOM_EXTENSION_ERRORS.APPROVAL_TRANSITION_INVALID]);

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

  const runtimeSource = fs.readFileSync("www/src/engine/runtime/engineV2CustomExtensionsHookRuntime.js", "utf8");
  assert.equal(/\beval\s*\(/.test(runtimeSource), false);
  assert.equal(/\bnew\s+Function\b/.test(runtimeSource), false);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}

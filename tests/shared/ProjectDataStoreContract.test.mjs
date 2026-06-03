/*
Toolbox Aid
David Quesenberry
06/03/2026
ProjectDataStoreContract.test.mjs
*/

import assert from "node:assert/strict";
import {
  PROJECT_DATA_STORE_ADAPTER_METHODS,
  PROJECT_DATA_STORE_COLLECTIONS,
  PROJECT_DATA_STORE_COLLECTION_LIST,
  PROJECT_DATA_STORE_CONTRACT_ERRORS,
  PROJECT_DATA_STORE_CONTRACT_ID,
  PROJECT_DATA_STORE_CONTRACT_VERSION,
  PROJECT_DATA_STORE_CUSTOM_EXTENSION_APPROVAL_STATUS,
  PROJECT_DATA_STORE_CUSTOM_EXTENSION_APPROVAL_STATUS_LIST,
  PROJECT_DATA_STORE_FORBIDDEN_FIELDS,
  PROJECT_DATA_STORE_PUBLISH_STATUS,
  PROJECT_DATA_STORE_PUBLISH_STATUS_LIST,
  PROJECT_DATA_STORE_RECORD_TYPES,
  PROJECT_DATA_STORE_RECORD_TYPE_LIST,
  PROJECT_DATA_STORE_RULES,
  createEmptyProjectDataStoreSnapshot,
  createProjectDataStoreKey,
  isProjectDataStoreCollection,
  isProjectDataStoreCustomExtensionApprovalStatus,
  isProjectDataStorePublishStatus,
  isProjectDataStoreRecordType,
  projectDataStoreCollectionForType,
  validateProjectDataStoreAdapter,
  validateProjectDataStoreRecord,
  validateProjectDataStoreSnapshot,
} from "../../src/shared/contracts/projectDataStoreContract.js";

function createRecord(recordType, recordId, payload = {}) {
  return {
    recordType,
    recordId,
    ownerId: "user.owner",
    projectId: "project.alpha",
    payload,
  };
}

export function run() {
  assert.equal(PROJECT_DATA_STORE_CONTRACT_ID, "gamefoundrystudio.project-data-store.contract");
  assert.equal(PROJECT_DATA_STORE_CONTRACT_VERSION, "1.0.0");
  assert.deepEqual(PROJECT_DATA_STORE_RECORD_TYPE_LIST, [
    "project",
    "manifest",
    "asset",
    "toolOutput",
    "customExtension",
    "customExtensionApproval",
    "publishState",
  ]);
  assert.deepEqual(PROJECT_DATA_STORE_COLLECTION_LIST, [
    "projects",
    "manifests",
    "assets",
    "toolOutputs",
    "customExtensions",
    "customExtensionApprovals",
    "publishStates",
  ]);
  assert.deepEqual(PROJECT_DATA_STORE_ADAPTER_METHODS, [
    "putRecord",
    "getRecord",
    "listRecords",
    "deleteRecord",
    "clear",
  ]);

  assert.equal(PROJECT_DATA_STORE_RULES.STORES_PROJECTS, true);
  assert.equal(PROJECT_DATA_STORE_RULES.STORES_MANIFESTS, true);
  assert.equal(PROJECT_DATA_STORE_RULES.STORES_ASSETS, true);
  assert.equal(PROJECT_DATA_STORE_RULES.STORES_TOOL_OUTPUTS, true);
  assert.equal(PROJECT_DATA_STORE_RULES.STORES_CUSTOM_EXTENSIONS, true);
  assert.equal(PROJECT_DATA_STORE_RULES.STORES_CUSTOM_EXTENSION_APPROVALS, true);
  assert.equal(PROJECT_DATA_STORE_RULES.STORES_PUBLISH_STATE, true);
  assert.equal(PROJECT_DATA_STORE_RULES.INDEPENDENT_FROM_UI_AND_TOOL_PAGES, true);
  assert.equal(PROJECT_DATA_STORE_RULES.SWAPPABLE_FOR_REAL_DATABASE, true);
  assert.equal(PROJECT_DATA_STORE_RULES.NO_LOCAL_STORAGE_AS_AUTHORITATIVE_STORE, true);
  assert.equal(PROJECT_DATA_STORE_RULES.NO_SESSION_STORAGE_AS_AUTHORITATIVE_STORE, true);
  assert.equal(PROJECT_DATA_STORE_RULES.NO_AUTH_SESSION_STATE, true);
  assert.equal(PROJECT_DATA_STORE_RULES.NO_RUNTIME_WORKSPACE_STATE, true);

  assert.deepEqual(PROJECT_DATA_STORE_CUSTOM_EXTENSION_APPROVAL_STATUS_LIST, [
    "draft",
    "private",
    "submitted",
    "aiValidated",
    "aiRejected",
    "humanApproved",
    "humanRejected",
    "promotedCandidate",
  ]);
  assert.deepEqual(PROJECT_DATA_STORE_PUBLISH_STATUS_LIST, [
    "draft",
    "blocked",
    "eligible",
    "published",
    "retired",
  ]);
  assert.equal(PROJECT_DATA_STORE_FORBIDDEN_FIELDS.includes("localStorage"), true);
  assert.equal(PROJECT_DATA_STORE_FORBIDDEN_FIELDS.includes("sessionStorage"), true);
  assert.equal(PROJECT_DATA_STORE_FORBIDDEN_FIELDS.includes("toolPage"), true);
  assert.equal(PROJECT_DATA_STORE_FORBIDDEN_FIELDS.includes("workspaceState"), true);

  assert.equal(isProjectDataStoreRecordType(PROJECT_DATA_STORE_RECORD_TYPES.PROJECT), true);
  assert.equal(isProjectDataStoreRecordType("workspaceState"), false);
  assert.equal(isProjectDataStoreCollection(PROJECT_DATA_STORE_COLLECTIONS.PROJECTS), true);
  assert.equal(isProjectDataStoreCollection("uiPages"), false);
  assert.equal(isProjectDataStoreCustomExtensionApprovalStatus(PROJECT_DATA_STORE_CUSTOM_EXTENSION_APPROVAL_STATUS.HUMAN_APPROVED), true);
  assert.equal(isProjectDataStoreCustomExtensionApprovalStatus("approved"), false);
  assert.equal(isProjectDataStorePublishStatus(PROJECT_DATA_STORE_PUBLISH_STATUS.ELIGIBLE), true);
  assert.equal(isProjectDataStorePublishStatus("marketplaceApproved"), false);
  assert.equal(createProjectDataStoreKey(PROJECT_DATA_STORE_RECORD_TYPES.PROJECT, "project.alpha"), "project:project.alpha");
  assert.equal(createProjectDataStoreKey("unknown", "project.alpha"), null);

  assert.equal(projectDataStoreCollectionForType(PROJECT_DATA_STORE_RECORD_TYPES.PROJECT), PROJECT_DATA_STORE_COLLECTIONS.PROJECTS);
  assert.equal(projectDataStoreCollectionForType(PROJECT_DATA_STORE_RECORD_TYPES.MANIFEST), PROJECT_DATA_STORE_COLLECTIONS.MANIFESTS);
  assert.equal(projectDataStoreCollectionForType(PROJECT_DATA_STORE_RECORD_TYPES.ASSET), PROJECT_DATA_STORE_COLLECTIONS.ASSETS);
  assert.equal(projectDataStoreCollectionForType(PROJECT_DATA_STORE_RECORD_TYPES.TOOL_OUTPUT), PROJECT_DATA_STORE_COLLECTIONS.TOOL_OUTPUTS);
  assert.equal(projectDataStoreCollectionForType(PROJECT_DATA_STORE_RECORD_TYPES.CUSTOM_EXTENSION), PROJECT_DATA_STORE_COLLECTIONS.CUSTOM_EXTENSIONS);
  assert.equal(projectDataStoreCollectionForType(PROJECT_DATA_STORE_RECORD_TYPES.CUSTOM_EXTENSION_APPROVAL), PROJECT_DATA_STORE_COLLECTIONS.CUSTOM_EXTENSION_APPROVALS);
  assert.equal(projectDataStoreCollectionForType(PROJECT_DATA_STORE_RECORD_TYPES.PUBLISH_STATE), PROJECT_DATA_STORE_COLLECTIONS.PUBLISH_STATES);

  const validRecords = [
    createRecord(PROJECT_DATA_STORE_RECORD_TYPES.PROJECT, "project.alpha", { projectType: "game" }),
    createRecord(PROJECT_DATA_STORE_RECORD_TYPES.MANIFEST, "manifest.alpha", { manifestId: "manifest.alpha" }),
    createRecord(PROJECT_DATA_STORE_RECORD_TYPES.ASSET, "asset.vector.alpha", { assetType: "vector" }),
    createRecord(PROJECT_DATA_STORE_RECORD_TYPES.TOOL_OUTPUT, "tool-output.palette.alpha", { toolType: "palette-manager-v2" }),
    createRecord(PROJECT_DATA_STORE_RECORD_TYPES.CUSTOM_EXTENSION, "custom-extension.weather", { displayName: "Weather Polish" }),
    createRecord(PROJECT_DATA_STORE_RECORD_TYPES.CUSTOM_EXTENSION_APPROVAL, "approval.weather", { approvalStatus: "submitted" }),
    createRecord(PROJECT_DATA_STORE_RECORD_TYPES.PUBLISH_STATE, "publish-state.alpha", { publishStatus: "blocked" }),
  ];

  validRecords.forEach((record) => {
    const validation = validateProjectDataStoreRecord(record);
    assert.equal(validation.valid, true, record.recordType);
    assert.deepEqual(validation.errors, []);
  });

  const emptySnapshot = createEmptyProjectDataStoreSnapshot();
  assert.equal(validateProjectDataStoreSnapshot(emptySnapshot).valid, true);
  PROJECT_DATA_STORE_COLLECTION_LIST.forEach((collectionName) => {
    assert.equal(Object.isFrozen(emptySnapshot[collectionName]), true);
  });

  const populatedSnapshot = {
    ...createEmptyProjectDataStoreSnapshot(),
    projects: [validRecords[0]],
    manifests: [validRecords[1]],
    assets: [validRecords[2]],
    toolOutputs: [validRecords[3]],
    customExtensions: [validRecords[4]],
    customExtensionApprovals: [validRecords[5]],
    publishStates: [validRecords[6]],
  };
  assert.equal(validateProjectDataStoreSnapshot(populatedSnapshot).valid, true);

  assertErrorCodes(validateProjectDataStoreRecord(null), [PROJECT_DATA_STORE_CONTRACT_ERRORS.RECORD_INVALID]);
  assertErrorCodes(validateProjectDataStoreRecord(createRecord("runtimeWorkspace", "runtime.workspace")), [PROJECT_DATA_STORE_CONTRACT_ERRORS.RECORD_TYPE_INVALID]);
  assertErrorCodes(validateProjectDataStoreRecord({ ...validRecords[0], recordId: "" }), [PROJECT_DATA_STORE_CONTRACT_ERRORS.RECORD_ID_REQUIRED]);
  assertErrorCodes(validateProjectDataStoreRecord({ ...validRecords[0], ownerId: "" }), [PROJECT_DATA_STORE_CONTRACT_ERRORS.OWNER_REQUIRED]);
  assertErrorCodes(validateProjectDataStoreRecord({ ...validRecords[0], projectId: "" }), [PROJECT_DATA_STORE_CONTRACT_ERRORS.PROJECT_REQUIRED]);
  assertErrorCodes(validateProjectDataStoreRecord({ ...validRecords[0], payload: null }), [PROJECT_DATA_STORE_CONTRACT_ERRORS.PAYLOAD_REQUIRED]);
  assertErrorCodes(validateProjectDataStoreRecord({ ...validRecords[0], payload: "not-object" }), [PROJECT_DATA_STORE_CONTRACT_ERRORS.PAYLOAD_INVALID]);
  assertErrorCodes(validateProjectDataStoreRecord({ ...validRecords[5], payload: { approvalStatus: "aiApproved" } }), [PROJECT_DATA_STORE_CONTRACT_ERRORS.APPROVAL_STATUS_INVALID]);
  assertErrorCodes(validateProjectDataStoreRecord({ ...validRecords[6], payload: { publishStatus: "ready" } }), [PROJECT_DATA_STORE_CONTRACT_ERRORS.PUBLISH_STATUS_INVALID]);
  assertErrorCodes(validateProjectDataStoreRecord({ ...validRecords[0], localStorage: {} }), [PROJECT_DATA_STORE_CONTRACT_ERRORS.FIELD_NOT_ALLOWED]);
  assertErrorCodes(validateProjectDataStoreRecord({ ...validRecords[0], payload: { toolPage: "/toolbox/index.html" } }), [PROJECT_DATA_STORE_CONTRACT_ERRORS.FIELD_NOT_ALLOWED]);

  const wrongCollectionSnapshot = {
    ...createEmptyProjectDataStoreSnapshot(),
    assets: [validRecords[1]],
  };
  assertErrorCodes(validateProjectDataStoreSnapshot(wrongCollectionSnapshot), [PROJECT_DATA_STORE_CONTRACT_ERRORS.COLLECTION_RECORD_TYPE_MISMATCH]);

  assert.equal(validateProjectDataStoreAdapter({
    putRecord() {},
    getRecord() {},
    listRecords() {},
    deleteRecord() {},
    clear() {},
  }).valid, true);
  assertErrorCodes(validateProjectDataStoreAdapter({ putRecord() {} }), [
    PROJECT_DATA_STORE_CONTRACT_ERRORS.ADAPTER_INVALID,
    PROJECT_DATA_STORE_CONTRACT_ERRORS.ADAPTER_INVALID,
    PROJECT_DATA_STORE_CONTRACT_ERRORS.ADAPTER_INVALID,
    PROJECT_DATA_STORE_CONTRACT_ERRORS.ADAPTER_INVALID,
  ]);
}

function assertErrorCodes(validation, expectedCodes) {
  assert.equal(validation.valid, false);
  assert.deepEqual(validation.errors.map((error) => error.code), expectedCodes);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}

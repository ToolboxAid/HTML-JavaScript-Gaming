/*
Toolbox Aid
David Quesenberry
06/03/2026
InMemoryProjectDataStore.test.mjs
*/

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  PROJECT_DATA_STORE_CONTRACT_ERRORS,
  PROJECT_DATA_STORE_RECORD_TYPES,
  validateProjectDataStoreAdapter,
} from "../../../src/shared/contracts/projectDataStoreContract.js";
import {
  IN_MEMORY_PROJECT_DATA_STORE_KIND,
  createInMemoryProjectDataStore,
} from "../../../src/shared/projectDataStore/inMemoryProjectDataStore.js";

function createRecord(recordType, recordId, payload = {}, overrides = {}) {
  return {
    recordType,
    recordId,
    ownerId: "user.owner",
    projectId: "project.alpha",
    payload,
    ...overrides,
  };
}

export function run() {
  const projectRecord = createRecord(PROJECT_DATA_STORE_RECORD_TYPES.PROJECT, "project.alpha", {
    projectType: "game",
    title: "Alpha",
  });
  const manifestRecord = createRecord(PROJECT_DATA_STORE_RECORD_TYPES.MANIFEST, "manifest.alpha", {
    manifestId: "manifest.alpha",
    sceneCount: 2,
  });
  const assetRecord = createRecord(PROJECT_DATA_STORE_RECORD_TYPES.ASSET, "asset.vector.alpha", {
    assetType: "vector",
  });
  const approvalRecord = createRecord(PROJECT_DATA_STORE_RECORD_TYPES.CUSTOM_EXTENSION_APPROVAL, "approval.weather", {
    approvalStatus: "submitted",
  });
  const publishRecord = createRecord(PROJECT_DATA_STORE_RECORD_TYPES.PUBLISH_STATE, "publish-state.alpha", {
    publishStatus: "blocked",
  }, {
    ownerId: "user.publisher",
  });

  const store = createInMemoryProjectDataStore({
    initialRecords: [projectRecord],
  });

  assert.equal(store.kind, IN_MEMORY_PROJECT_DATA_STORE_KIND);
  assert.equal(Object.isFrozen(store), true);
  assert.equal(validateProjectDataStoreAdapter(store).valid, true);
  assert.deepEqual(store.listRecords().map((record) => record.recordId), ["project.alpha"]);

  const putManifestResult = store.putRecord(manifestRecord);
  assert.equal(putManifestResult.valid, true);
  assert.deepEqual(putManifestResult.errors, []);
  assert.equal(putManifestResult.record.recordId, "manifest.alpha");

  const mutableAssetRecord = structuredClone(assetRecord);
  const putAssetResult = store.putRecord(mutableAssetRecord);
  mutableAssetRecord.payload.assetType = "mutated-after-put";
  assert.equal(putAssetResult.valid, true);
  assert.equal(store.getRecord(PROJECT_DATA_STORE_RECORD_TYPES.ASSET, "asset.vector.alpha").payload.assetType, "vector");

  assert.equal(store.putRecord(approvalRecord).valid, true);
  assert.equal(store.putRecord(publishRecord).valid, true);

  const fetchedManifest = store.getRecord(PROJECT_DATA_STORE_RECORD_TYPES.MANIFEST, "manifest.alpha");
  assert.equal(fetchedManifest.payload.sceneCount, 2);
  assert.equal(Object.isFrozen(fetchedManifest), true);
  assert.equal(Object.isFrozen(fetchedManifest.payload), true);

  assert.throws(() => {
    fetchedManifest.payload.sceneCount = 99;
  }, TypeError);
  assert.equal(store.getRecord(PROJECT_DATA_STORE_RECORD_TYPES.MANIFEST, "manifest.alpha").payload.sceneCount, 2);

  const replacementManifest = {
    ...manifestRecord,
    payload: {
      manifestId: "manifest.alpha",
      sceneCount: 3,
    },
  };
  assert.equal(store.putRecord(replacementManifest).valid, true);
  assert.equal(store.getRecord(PROJECT_DATA_STORE_RECORD_TYPES.MANIFEST, "manifest.alpha").payload.sceneCount, 3);

  assert.deepEqual(store.listRecords({ projectId: "project.alpha" }).map((record) => record.recordId), [
    "asset.vector.alpha",
    "approval.weather",
    "manifest.alpha",
    "project.alpha",
    "publish-state.alpha",
  ]);
  assert.deepEqual(store.listRecords({ ownerId: "user.publisher" }).map((record) => record.recordId), [
    "publish-state.alpha",
  ]);
  assert.deepEqual(store.listRecords({ recordType: PROJECT_DATA_STORE_RECORD_TYPES.MANIFEST }).map((record) => record.recordId), [
    "manifest.alpha",
  ]);

  const invalidPut = store.putRecord({
    ...manifestRecord,
    recordId: "manifest.invalid",
    payload: {
      manifestId: "manifest.invalid",
      localStorage: {},
    },
  });
  assert.equal(invalidPut.valid, false);
  assert.deepEqual(invalidPut.errors.map((error) => error.code), [PROJECT_DATA_STORE_CONTRACT_ERRORS.FIELD_NOT_ALLOWED]);
  assert.equal(store.getRecord(PROJECT_DATA_STORE_RECORD_TYPES.MANIFEST, "manifest.invalid"), null);

  assert.equal(store.deleteRecord(PROJECT_DATA_STORE_RECORD_TYPES.ASSET, "asset.vector.alpha"), true);
  assert.equal(store.getRecord(PROJECT_DATA_STORE_RECORD_TYPES.ASSET, "asset.vector.alpha"), null);
  assert.equal(store.deleteRecord(PROJECT_DATA_STORE_RECORD_TYPES.ASSET, "asset.vector.alpha"), false);

  assert.equal(store.clear(), true);
  assert.deepEqual(store.listRecords(), []);

  assert.throws(() => createInMemoryProjectDataStore({
    initialRecords: [{
      ...projectRecord,
      recordId: "project.invalid",
      payload: {
        projectType: "game",
        sessionStorage: {},
      },
    }],
  }), /PROJECT_DATA_STORE_FIELD_NOT_ALLOWED/);

  const storeSource = readFileSync("src/shared/projectDataStore/inMemoryProjectDataStore.js", "utf8");
  assert.equal(/localStorage/.test(storeSource), false);
  assert.equal(/sessionStorage/.test(storeSource), false);
  assert.equal(/indexedDB/.test(storeSource), false);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}

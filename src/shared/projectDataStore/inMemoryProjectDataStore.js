/*
Toolbox Aid
David Quesenberry
06/03/2026
inMemoryProjectDataStore.js
*/

import {
  PROJECT_DATA_STORE_ADAPTER_METHODS,
  createProjectDataStoreKey,
  validateProjectDataStoreRecord,
} from "../contracts/projectDataStoreContract.js";

export const IN_MEMORY_PROJECT_DATA_STORE_KIND = "in-memory-project-data-store";

export function createInMemoryProjectDataStore({ initialRecords = [] } = {}) {
  const records = new Map();

  const adapter = {
    kind: IN_MEMORY_PROJECT_DATA_STORE_KIND,
    methods: PROJECT_DATA_STORE_ADAPTER_METHODS,
    putRecord(record) {
      const validation = validateProjectDataStoreRecord(record);

      if (!validation.valid) {
        return freezeResult({
          valid: false,
          record: null,
          errors: validation.errors,
        });
      }

      const storedRecord = freezeJsonClone(record);
      records.set(createProjectDataStoreKey(storedRecord.recordType, storedRecord.recordId), storedRecord);

      return freezeResult({
        valid: true,
        record: cloneRecord(storedRecord),
        errors: Object.freeze([]),
      });
    },
    getRecord(recordType, recordId) {
      const storedRecord = records.get(createProjectDataStoreKey(recordType, recordId));
      return storedRecord ? cloneRecord(storedRecord) : null;
    },
    listRecords(filters = {}) {
      const recordType = filters?.recordType || null;
      const projectId = filters?.projectId || null;
      const ownerId = filters?.ownerId || null;

      return Object.freeze([...records.values()]
        .filter((record) => !recordType || record.recordType === recordType)
        .filter((record) => !projectId || record.projectId === projectId)
        .filter((record) => !ownerId || record.ownerId === ownerId)
        .sort(compareProjectDataStoreRecords)
        .map((record) => cloneRecord(record)));
    },
    deleteRecord(recordType, recordId) {
      return records.delete(createProjectDataStoreKey(recordType, recordId));
    },
    clear() {
      records.clear();
      return true;
    },
  };

  initialRecords.forEach((record) => {
    const result = adapter.putRecord(record);

    if (!result.valid) {
      throw new Error(`Invalid initial in-memory project data store record: ${result.errors.map((error) => error.code).join(",")}`);
    }
  });

  return Object.freeze(adapter);
}

function compareProjectDataStoreRecords(left, right) {
  const leftKey = createProjectDataStoreKey(left.recordType, left.recordId);
  const rightKey = createProjectDataStoreKey(right.recordType, right.recordId);
  return leftKey.localeCompare(rightKey);
}

function cloneRecord(record) {
  return freezeJsonClone(record);
}

function freezeResult(result) {
  return Object.freeze({
    ...result,
    errors: Object.freeze([...result.errors]),
  });
}

function freezeJsonClone(value) {
  return deepFreeze(JSON.parse(JSON.stringify(value)));
}

function deepFreeze(value) {
  if (value && typeof value === "object") {
    Object.freeze(value);

    Object.values(value).forEach((child) => {
      deepFreeze(child);
    });
  }

  return value;
}

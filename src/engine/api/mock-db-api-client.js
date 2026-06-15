import {
  clearLocalDb,
  getLocalDbSnapshot,
  seedLocalDb,
} from "./local-db-api-client.js";

/**
 * @deprecated Use getLocalDbSnapshot from local-db-api-client.js.
 */
export function getMockDbSnapshot() {
  return getLocalDbSnapshot();
}

/**
 * @deprecated Use clearLocalDb from local-db-api-client.js.
 */
export function clearMockDb() {
  return clearLocalDb();
}

/**
 * @deprecated Use seedLocalDb from local-db-api-client.js.
 */
export function seedMockDb() {
  return seedLocalDb();
}

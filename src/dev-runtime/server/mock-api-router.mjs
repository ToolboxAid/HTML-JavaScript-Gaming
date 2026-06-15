import { createLocalApiRouter } from "./local-api-router.mjs";

export { createLocalApiRouter } from "./local-api-router.mjs";

/**
 * @deprecated Use createLocalApiRouter from local-api-router.mjs.
 * This compatibility export remains until older tests/helpers finish their
 * Local DB naming migration.
 */
export function createMockApiRouter() {
  return createLocalApiRouter();
}

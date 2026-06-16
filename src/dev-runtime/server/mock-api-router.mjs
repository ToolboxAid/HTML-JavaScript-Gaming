import { createLocalApiRouter } from "./local-api-router.mjs";

export { createLocalApiRouter } from "./local-api-router.mjs";

/**
 * @deprecated Use createLocalApiRouter from local-api-router.mjs.
 * This compatibility export remains for older tests/helpers while the API
 * runtime keeps its legacy file names.
 */
export function createMockApiRouter() {
  return createLocalApiRouter();
}

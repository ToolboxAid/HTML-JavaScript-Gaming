import assert from "node:assert/strict";
import test from "node:test";

import {
  requireServerApiData,
  SERVER_DATA_BOUNDARY_RULE,
} from "../../src/api/server-api-client.js";

test("requireServerApiData returns the server data payload", () => {
  assert.deepEqual(
    requireServerApiData({
      ok: true,
      payload: {
        data: {
          status: "ready",
        },
        ok: true,
      },
    }, "Runtime API"),
    { status: "ready" },
  );
});

test("requireServerApiData preserves server API errors", () => {
  assert.throws(
    () => requireServerApiData({
      error: "Server API unavailable.",
      ok: false,
      payload: null,
    }, "Runtime API"),
    /Server API unavailable\./,
  );
});

test("requireServerApiData reports the shared boundary for missing data", () => {
  assert.throws(
    () => requireServerApiData({
      ok: true,
      payload: {
        ok: true,
      },
    }, "Runtime API"),
    new RegExp(`Runtime API did not return server data\\. Restore the ${SERVER_DATA_BOUNDARY_RULE} contract\\.`),
  );
});

test("requireServerApiData supports client-specific restore guidance", () => {
  assert.throws(
    () => requireServerApiData({
      ok: true,
      payload: {
        ok: true,
      },
    }, "Admin setup status", {
      restoreMessage: "Restore the admin setup API.",
    }),
    /Admin setup status did not return server data\. Restore the admin setup API\./,
  );
});

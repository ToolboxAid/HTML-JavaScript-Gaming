import assert from "node:assert/strict";
import test from "node:test";

import { clearPublicConfigCache } from "../../src/api/public-config-client.js";
import {
  clearServerApiDiagnostics,
  requireServerApiData,
  SERVER_DATA_BOUNDARY_RULE,
} from "../../src/api/server-api-client.js";
import { logoutSessionUser } from "../../src/api/session-api-client.js";

function installMockServerApi(routes) {
  const calls = [];
  const previousWindow = globalThis.window;
  const previousXmlHttpRequest = globalThis.XMLHttpRequest;

  clearPublicConfigCache();
  clearServerApiDiagnostics();

  globalThis.window = {
    GameFoundryPublicConfig: {
      apiUrl: "http://runtime-api.test/api",
    },
  };

  globalThis.XMLHttpRequest = class MockXMLHttpRequest {
    constructor() {
      this.headers = {};
      this.responseText = "";
      this.status = 0;
    }

    open(method, url, async) {
      this.method = method;
      this.url = url;
      this.async = async;
    }

    setRequestHeader(name, value) {
      this.headers[name] = value;
    }

    send(body) {
      calls.push({
        body,
        headers: { ...this.headers },
        method: this.method,
        url: this.url,
      });
      const route = routes[`${this.method} ${this.url}`] || {
        payload: {
          error: `No mock route for ${this.method} ${this.url}`,
          ok: false,
        },
        status: 404,
      };
      this.status = route.status;
      this.responseText = JSON.stringify(route.payload);
    }
  };

  return {
    calls,
    restore() {
      if (previousWindow === undefined) {
        delete globalThis.window;
      } else {
        globalThis.window = previousWindow;
      }
      if (previousXmlHttpRequest === undefined) {
        delete globalThis.XMLHttpRequest;
      } else {
        globalThis.XMLHttpRequest = previousXmlHttpRequest;
      }
      clearPublicConfigCache();
      clearServerApiDiagnostics();
    },
  };
}

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

test("logoutSessionUser uses the standardized session server data boundary", () => {
  const mockApi = installMockServerApi({
    "POST http://runtime-api.test/api/session/logout": {
      payload: {
        data: {
          authenticated: false,
          userKey: "",
        },
        ok: true,
      },
      status: 200,
    },
  });

  try {
    assert.deepEqual(logoutSessionUser(), {
      authenticated: false,
      userKey: "",
    });
    assert.deepEqual(mockApi.calls, [
      {
        body: null,
        headers: {
          Accept: "application/json",
        },
        method: "POST",
        url: "http://runtime-api.test/api/session/logout",
      },
    ]);
  } finally {
    mockApi.restore();
  }
});

test("logoutSessionUser preserves session restore guidance for missing server data", () => {
  const mockApi = installMockServerApi({
    "POST http://runtime-api.test/api/session/logout": {
      payload: {
        ok: true,
      },
      status: 200,
    },
  });

  try {
    assert.throws(
      () => logoutSessionUser(),
      /Session logout did not return server data\. Restore the server auth\/session API\./,
    );
  } finally {
    mockApi.restore();
  }
});

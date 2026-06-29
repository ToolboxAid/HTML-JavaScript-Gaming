import assert from "node:assert/strict";
import test from "node:test";

import { clearPublicConfigCache } from "../../../www/src/api/public-config-client.js";
import {
  callServerToolFunction,
  clearServerApiDiagnostics,
  createServerRepositoryClient,
  readServerToolConstants,
  requireServerApiData,
  SERVER_DATA_BOUNDARY_RULE,
  safeRequestServerApi,
} from "../../../www/src/api/server-api-client.js";
import { logoutSessionUser } from "../../../www/src/api/session-api-client.js";

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
      this.async = async;
      this.method = method;
      this.url = url;
    }

    setRequestHeader(name, value) {
      this.headers[name] = value;
    }

    send(body) {
      calls.push({
        async: this.async,
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
      this.responseText = typeof route.payload === "string"
        ? route.payload
        : JSON.stringify(route.payload);
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

test("safeRequestServerApi sends JSON requests through the configured server API", () => {
  const mockApi = installMockServerApi({
    "POST http://runtime-api.test/api/runtime/echo": {
      payload: {
        data: {
          status: "accepted",
        },
        ok: true,
      },
      status: 200,
    },
  });

  try {
    assert.deepEqual(
      safeRequestServerApi("/runtime/echo", {
        body: { value: 42 },
        method: "POST",
      }),
      {
        ok: true,
        payload: {
          data: {
            status: "accepted",
          },
          ok: true,
        },
      },
    );
    assert.deepEqual(mockApi.calls, [
      {
        async: false,
        body: JSON.stringify({ value: 42 }),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        method: "POST",
        url: "http://runtime-api.test/api/runtime/echo",
      },
    ]);
  } finally {
    mockApi.restore();
  }
});

test("safeRequestServerApi reports static-only route failures without throwing", () => {
  const mockApi = installMockServerApi({
    "GET http://runtime-api.test/api/runtime/missing": {
      payload: {
        ok: false,
      },
      status: 404,
    },
  });

  try {
    const response = safeRequestServerApi("/runtime/missing");
    assert.equal(response.ok, false);
    assert.match(
      response.error,
      /Server API route unavailable for GET http:\/\/runtime-api\.test\/api\/runtime\/missing \(404\)/,
    );
  } finally {
    mockApi.restore();
  }
});

test("server tool helpers consume server-owned constants and function results", () => {
  const mockApi = installMockServerApi({
    "GET http://runtime-api.test/api/toolbox/game-hub/constants": {
      payload: {
        data: {
          statusOptions: ["New", "Ready"],
        },
        ok: true,
      },
      status: 200,
    },
    "POST http://runtime-api.test/api/toolbox/game-hub/functions/formatStatus": {
      payload: {
        data: {
          result: "READY",
        },
        ok: true,
      },
      status: 200,
    },
  });

  try {
    assert.deepEqual(readServerToolConstants("game-hub"), {
      statusOptions: ["New", "Ready"],
    });
    assert.equal(callServerToolFunction("game-hub", "formatStatus", "ready"), "READY");
    assert.deepEqual(mockApi.calls.map((call) => ({
      body: call.body,
      method: call.method,
      url: call.url,
    })), [
      {
        body: null,
        method: "GET",
        url: "http://runtime-api.test/api/toolbox/game-hub/constants",
      },
      {
        body: JSON.stringify({ args: ["ready"] }),
        method: "POST",
        url: "http://runtime-api.test/api/toolbox/game-hub/functions/formatStatus",
      },
    ]);
  } finally {
    mockApi.restore();
  }
});

test("createServerRepositoryClient routes method calls through repository ids", () => {
  const mockApi = installMockServerApi({
    "POST http://runtime-api.test/api/toolbox/game-hub/repositories": {
      payload: {
        data: {
          repositoryId: "repo-123",
        },
        ok: true,
      },
      status: 200,
    },
    "POST http://runtime-api.test/api/toolbox/game-hub/repositories/repo-123/methods/listGames": {
      payload: {
        data: {
          result: [{ id: "game-1" }],
        },
        ok: true,
      },
      status: 200,
    },
  });

  try {
    const repository = createServerRepositoryClient("game-hub", { mode: "test" });
    assert.equal(repository.__apiRepositoryId(), "repo-123");
    assert.deepEqual(repository.listGames({ status: "Ready" }), [{ id: "game-1" }]);
    assert.deepEqual(mockApi.calls.map((call) => ({
      body: call.body,
      method: call.method,
      url: call.url,
    })), [
      {
        body: JSON.stringify({ options: { mode: "test" } }),
        method: "POST",
        url: "http://runtime-api.test/api/toolbox/game-hub/repositories",
      },
      {
        body: JSON.stringify({ args: [{ status: "Ready" }] }),
        method: "POST",
        url: "http://runtime-api.test/api/toolbox/game-hub/repositories/repo-123/methods/listGames",
      },
    ]);
  } finally {
    mockApi.restore();
  }
});

test("createServerRepositoryClient returns blocked validation when repository init fails", () => {
  const mockApi = installMockServerApi({
    "POST http://runtime-api.test/api/toolbox/game-hub/repositories": {
      payload: {
        error: "Server data source unavailable.",
        ok: false,
      },
      status: 503,
    },
  });

  try {
    const repository = createServerRepositoryClient("game-hub");
    assert.equal(repository.__apiRepositoryId(), "");
    assert.match(repository.__apiDiagnostic(), /Server data source unavailable/);
    assert.deepEqual(repository.listGames(), {
      error: true,
      message: "Server data source unavailable.",
      validation: {
        findings: [
          {
            action: "Start the local server API or restore the server data source.",
            label: "Server data source missing",
            status: "Blocked",
          },
        ],
        status: "Blocked",
      },
    });
  } finally {
    mockApi.restore();
  }
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

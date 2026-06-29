import assert from "node:assert/strict";
import test from "node:test";
import {
  clearPublicConfigCache,
  getPublicConfigDiagnostics,
  resolveServerApiUrl,
} from "../../../www/src/api/public-config-client.js";

function installMockBrowser(origin, responses) {
  const calls = [];
  globalThis.window = {
    location: new URL(origin),
  };
  globalThis.XMLHttpRequest = class MockXMLHttpRequest {
    constructor() {
      this.headers = {};
      this.responseText = "";
      this.status = 0;
      this.url = "";
    }

    open(method, url, async) {
      this.async = async;
      this.method = method;
      this.url = new URL(url, origin).href;
    }

    setRequestHeader(name, value) {
      this.headers[name] = value;
    }

    send(body) {
      calls.push({
        async: this.async,
        body,
        headers: this.headers,
        method: this.method,
        url: this.url,
      });
      const response = responses[this.url] || { body: { ok: false }, status: 404 };
      this.status = response.status;
      this.responseText = JSON.stringify(response.body);
    }
  };
  clearPublicConfigCache();
  return calls;
}

function removeMockBrowser() {
  clearPublicConfigCache();
  delete globalThis.window;
  delete globalThis.XMLHttpRequest;
}

test("server API URLs resolve against configured browser-safe apiUrl", () => {
  const calls = installMockBrowser("http://127.0.0.1:5500/index.html", {
    "http://127.0.0.1:5500/api/public/config": {
      body: { ok: false },
      status: 404,
    },
    "http://127.0.0.1:5501/api/public/config": {
      body: {
        data: {
          publicConfig: {
            apiUrl: "http://127.0.0.1:5501/api",
            environmentLabel: "Development Environment",
            siteUrl: "http://127.0.0.1:5501",
          },
        },
        ok: true,
      },
      status: 200,
    },
  });

  try {
    assert.equal(
      resolveServerApiUrl("/auth/status"),
      "http://127.0.0.1:5501/api/auth/status",
    );
    assert.equal(
      resolveServerApiUrl("/api/admin/system-health/status"),
      "http://127.0.0.1:5501/api/admin/system-health/status",
    );
    assert.deepEqual(
      calls.map((call) => call.url),
      [
        "http://127.0.0.1:5501/api/public/config",
      ],
    );
    assert.deepEqual(getPublicConfigDiagnostics(), []);
  } finally {
    removeMockBrowser();
  }
});

test("missing apiUrl falls back to same-origin with actionable diagnostic", () => {
  installMockBrowser("http://127.0.0.1:5500/index.html", {
    "http://127.0.0.1:5500/api/public/config": {
      body: {
        data: {
          publicConfig: {
            apiUrl: "",
            environmentLabel: "Development Environment",
            siteUrl: "http://127.0.0.1:5501",
          },
        },
        ok: true,
      },
      status: 200,
    },
  });

  try {
    assert.equal(resolveServerApiUrl("/auth/status"), "/api/auth/status");
    assert.match(getPublicConfigDiagnostics().join("\n"), /GAMEFOUNDRY_API_URL/);
    assert.match(getPublicConfigDiagnostics().join("\n"), /same-origin \/api/);
  } finally {
    removeMockBrowser();
  }
});

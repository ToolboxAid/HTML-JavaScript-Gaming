export const SERVER_DATA_BOUNDARY_RULE = "Browser -> Server API -> Data Source";

const API_ROOT = "/api";
const diagnostics = [];

function recordDiagnostic(message) {
  diagnostics.push(message);
  return message;
}

function hasBrowserRequest() {
  return typeof XMLHttpRequest !== "undefined";
}

export function getServerApiDiagnostics() {
  return diagnostics.slice();
}

export function clearServerApiDiagnostics() {
  diagnostics.splice(0);
}

export function requestServerApi(path, options = {}) {
  if (!hasBrowserRequest()) {
    throw new Error("Server API client requires a browser XMLHttpRequest runtime.");
  }

  const xhr = new XMLHttpRequest();
  const method = options.method || "GET";
  const url = path.startsWith(API_ROOT) ? path : `${API_ROOT}${path.startsWith("/") ? "" : "/"}${path}`;
  xhr.open(method, url, false);
  xhr.setRequestHeader("Accept", "application/json");
  if (options.body !== undefined) {
    xhr.setRequestHeader("Content-Type", "application/json");
  }
  xhr.send(options.body === undefined ? null : JSON.stringify(options.body));

  let payload = null;
  try {
    payload = xhr.responseText ? JSON.parse(xhr.responseText) : null;
  } catch {
    payload = { error: xhr.responseText || "Server API returned a non-JSON response." };
  }

  if (xhr.status < 200 || xhr.status >= 300 || payload?.ok === false) {
    const message = payload?.error || payload?.message || `Server API request failed: ${method} ${url} (${xhr.status}).`;
    throw new Error(recordDiagnostic(message));
  }

  return payload;
}

export function safeRequestServerApi(path, options = {}) {
  try {
    return {
      ok: true,
      payload: requestServerApi(path, options),
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : String(error || "Server API unavailable."),
      ok: false,
      payload: null,
    };
  }
}

export function readServerToolConstants(toolId) {
  const response = safeRequestServerApi(`/toolbox/${encodeURIComponent(toolId)}/constants`);
  if (!response.ok) {
    return {};
  }
  return response.payload?.data || {};
}

export function callServerToolFunction(toolId, functionName, ...args) {
  const response = safeRequestServerApi(
    `/toolbox/${encodeURIComponent(toolId)}/functions/${encodeURIComponent(functionName)}`,
    {
      body: { args },
      method: "POST",
    },
  );
  if (!response.ok) {
    throw new Error(response.error);
  }
  return response.payload?.data?.result;
}

function missingServerResult(methodName, diagnostic) {
  return {
    error: true,
    message: diagnostic || `Server API data source missing for ${methodName}.`,
    validation: {
      findings: [
        {
          action: "Start the Local/DEV server API or restore the server data source.",
          label: "Server data source missing",
          status: "Blocked",
        },
      ],
      status: "Blocked",
    },
  };
}

export function createServerRepositoryClient(toolId, initOptions = {}) {
  let repositoryId = "";
  let diagnostic = "";
  const initResponse = safeRequestServerApi(`/toolbox/${encodeURIComponent(toolId)}/repositories`, {
    body: { options: initOptions },
    method: "POST",
  });
  if (initResponse.ok) {
    repositoryId = initResponse.payload?.data?.repositoryId || "";
  } else {
    diagnostic = initResponse.error;
  }

  return new Proxy({
    __apiDiagnostic: () => diagnostic,
    __apiRepositoryId: () => repositoryId,
    __serverBoundaryRule: () => SERVER_DATA_BOUNDARY_RULE,
  }, {
    get(target, property) {
      if (property in target) {
        return target[property];
      }
      if (typeof property !== "string") {
        return undefined;
      }
      return (...args) => {
        if (!repositoryId) {
          return missingServerResult(property, diagnostic);
        }
        const response = safeRequestServerApi(
          `/toolbox/${encodeURIComponent(toolId)}/repositories/${encodeURIComponent(repositoryId)}/methods/${encodeURIComponent(property)}`,
          {
            body: { args },
            method: "POST",
          },
        );
        if (!response.ok) {
          diagnostic = response.error;
          return missingServerResult(property, diagnostic);
        }
        return response.payload?.data?.result;
      };
    },
  });
}

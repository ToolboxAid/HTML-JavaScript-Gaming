import {
  getPublicConfigDiagnostics,
  resolveServerApiUrl,
} from "./public-config-client.js";

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

function serverRouteUnavailableDiagnostic(method, url, status) {
  return `Server API route unavailable for ${method} ${url} (${status}). Start the site API route instead of a static-only server.`;
}

export function getServerApiDiagnostics() {
  return [
    ...diagnostics,
    ...getPublicConfigDiagnostics(),
  ];
}

export function clearServerApiDiagnostics() {
  diagnostics.splice(0);
}

export function requestServerApi(path, options = {}) {
  if (!hasBrowserRequest()) {
    throw new Error("Server API client requires a browser XMLHttpRequest runtime.");
  }

  const xhr = new XMLHttpRequest();
  const method = (options.method || "GET").toUpperCase();
  const apiPath = path.startsWith(API_ROOT) ? path : `${API_ROOT}${path.startsWith("/") ? "" : "/"}${path}`;
  const url = resolveServerApiUrl(apiPath);
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
    const message = xhr.status === 404 || xhr.status === 405
      ? serverRouteUnavailableDiagnostic(method, url, xhr.status)
      : payload?.error || payload?.message || `Server API request failed: ${method} ${url} (${xhr.status}).`;
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

export function requireServerApiData(response, context, options = {}) {
  if (!response.ok) {
    throw new Error(response.error);
  }
  if (!response.payload || !Object.prototype.hasOwnProperty.call(response.payload, "data")) {
    const restoreMessage = options.restoreMessage || `Restore the ${SERVER_DATA_BOUNDARY_RULE} contract.`;
    throw new Error(`${context} did not return server data. ${restoreMessage}`);
  }
  return response.payload.data;
}

export function readServerToolConstants(toolId) {
  const response = safeRequestServerApi(`/toolbox/${encodeURIComponent(toolId)}/constants`);
  return requireServerApiData(response, `${toolId} constants`);
}

export function requireServerConstant(constants, name, toolId) {
  if (!constants || !Object.prototype.hasOwnProperty.call(constants, name)) {
    throw new Error(`${toolId} constants did not include ${name}. Restore the server API contract.`);
  }
  return constants[name];
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
  const data = requireServerApiData(response, `${toolId}.${functionName}`);
  if (!Object.prototype.hasOwnProperty.call(data, "result")) {
    throw new Error(`${toolId}.${functionName} did not return a server result. Restore the server API contract.`);
  }
  return data.result;
}

function missingServerResult(methodName, diagnostic) {
  return {
    error: true,
    message: diagnostic || `Server API data source missing for ${methodName}.`,
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
    if (!repositoryId) {
      diagnostic = `Server API did not return a repository id for ${toolId}. Restore the server data source.`;
    }
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

import crypto from "node:crypto";
import { loadBackupStorageConfig, loadStorageConfig } from "./storage-config.mjs";

const AWS_ALGORITHM = "AWS4-HMAC-SHA256";
const AWS_REGION = "auto";
const AWS_SERVICE = "s3";
const EMPTY_PAYLOAD_HASH = crypto.createHash("sha256").update("").digest("hex");

function normalizeObjectKey(value) {
  return String(value || "").trim().replace(/\\/g, "/").replace(/\/{2,}/g, "/");
}

function encodePathSegment(segment) {
  return encodeURIComponent(segment).replace(/[!'()*]/g, (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`);
}

function encodeObjectPath(bucket, objectKey = "") {
  const bucketPath = `/${encodePathSegment(bucket)}`;
  const normalizedKey = normalizeObjectKey(objectKey);
  if (!normalizedKey) {
    return bucketPath;
  }
  return `${bucketPath}/${normalizedKey.replace(/^\/+/, "").split("/").map(encodePathSegment).join("/")}`;
}

function sha256Hex(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function hmac(key, value, outputEncoding = undefined) {
  return crypto.createHmac("sha256", key).update(value).digest(outputEncoding);
}

function signingKey(secretAccessKey, dateStamp) {
  const dateKey = hmac(`AWS4${secretAccessKey}`, dateStamp);
  const regionKey = hmac(dateKey, AWS_REGION);
  const serviceKey = hmac(regionKey, AWS_SERVICE);
  return hmac(serviceKey, "aws4_request");
}

function amzDate(now = new Date()) {
  return now.toISOString().replace(/[:-]|\.\d{3}/g, "");
}

function dateStamp(amzDateValue) {
  return amzDateValue.slice(0, 8);
}

function canonicalQuery(query = {}) {
  return Object.entries(query)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => [encodeURIComponent(key), encodeURIComponent(String(value))])
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
}

function signedRequestHeaders({ amzDateValue, contentType = "", host, payloadHash }) {
  const headers = {
    host,
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amzDateValue,
  };
  if (contentType) {
    headers["content-type"] = contentType;
  }
  return headers;
}

function authorizationHeader({ config, headers, method, pathname, queryString }) {
  const signedHeaders = Object.keys(headers).sort().join(";");
  const canonicalHeaders = Object.keys(headers)
    .sort()
    .map((key) => `${key}:${String(headers[key]).trim()}\n`)
    .join("");
  const canonicalRequest = [
    method,
    pathname,
    queryString,
    canonicalHeaders,
    signedHeaders,
    headers["x-amz-content-sha256"],
  ].join("\n");
  const requestDateStamp = dateStamp(headers["x-amz-date"]);
  const credentialScope = `${requestDateStamp}/${AWS_REGION}/${AWS_SERVICE}/aws4_request`;
  const stringToSign = [
    AWS_ALGORITHM,
    headers["x-amz-date"],
    credentialScope,
    sha256Hex(canonicalRequest),
  ].join("\n");
  const signature = hmac(signingKey(config.secretAccessKey, requestDateStamp), stringToSign, "hex");
  return `${AWS_ALGORITHM} Credential=${config.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
}

async function signedFetch(config, { body = null, contentType = "", method, objectKey = "", query = {} }) {
  const endpoint = new URL(config.endpoint);
  const pathname = encodeObjectPath(config.bucket, objectKey);
  const queryString = canonicalQuery(query);
  const payload = body ? Buffer.from(body) : Buffer.alloc(0);
  const payloadHash = body ? sha256Hex(payload) : EMPTY_PAYLOAD_HASH;
  const headers = signedRequestHeaders({
    amzDateValue: amzDate(),
    contentType,
    host: endpoint.host,
    payloadHash,
  });
  headers.authorization = authorizationHeader({
    config,
    headers,
    method,
    pathname,
    queryString,
  });
  const requestUrl = new URL(`${endpoint.origin}${pathname}`);
  requestUrl.search = queryString;
  return fetch(requestUrl, {
    body: method === "GET" ? undefined : payload,
    headers,
    method,
  });
}

function objectKeyForProjectPath(config, storedPath) {
  const normalizedStoredPath = normalizeObjectKey(storedPath).replace(/^\/+/, "");
  const projectRelativePath = normalizedStoredPath.startsWith("projects/")
    ? normalizedStoredPath.slice("projects/".length)
    : normalizedStoredPath;
  return `${config.projectsPrefix}${projectRelativePath}`.replace(/\/{2,}/g, "/");
}

function parseListBucketKeys(xml) {
  return Array.from(String(xml || "").matchAll(/<Key>([^<]+)<\/Key>/g))
    .map((match) => match[1]
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, "\"")
      .replace(/&apos;/g, "'"));
}

function unconfiguredStorage(config) {
  const missing = config.missingKeys?.length
    ? config.missingKeys.join(", ")
    : config.validationError || "storage config is incomplete";
  return {
    config,
    configured: false,
    objectKeyForProjectPath(storedPath) {
      return normalizeObjectKey(storedPath);
    },
    async listProjectObjects() {
      return {
        keys: [],
        message: `Storage configuration missing: ${missing}.`,
        ok: false,
      };
    },
    async listObjects() {
      return {
        keys: [],
        message: `Storage configuration missing: ${missing}.`,
        ok: false,
      };
    },
    async putObject() {
      return {
        bytesWritten: 0,
        message: `Storage configuration missing: ${missing}.`,
        ok: false,
        writeResult: "FAIL: Storage configuration missing",
      };
    },
    async readObject() {
      return {
        bytes: Buffer.alloc(0),
        message: `Storage configuration missing: ${missing}.`,
        ok: false,
      };
    },
    async deleteObject() {
      return {
        deleted: false,
        message: `Storage configuration missing: ${missing}.`,
        ok: false,
      };
    },
  };
}

async function listObjectsForPrefix(config, prefix) {
  const response = await signedFetch(config, {
    method: "GET",
    query: {
      "list-type": "2",
      prefix,
    },
  });
  const body = await response.text();
  if (!response.ok) {
    return {
      keys: [],
      message: `Storage list failed with HTTP ${response.status}.`,
      ok: false,
    };
  }
  return {
    keys: parseListBucketKeys(body),
    message: `Listed storage objects under ${prefix}.`,
    ok: true,
  };
}

export function createR2ProjectAssetStorage(config) {
  return {
    config,
    configured: true,
    objectKeyForProjectPath(storedPath) {
      return objectKeyForProjectPath(config, storedPath);
    },
    async listProjectObjects(projectId = "") {
      const prefix = projectId
        ? `${config.projectsPrefix}${String(projectId).trim().replace(/^\/+|\/+$/g, "")}/`
        : config.projectsPrefix;
      return listObjectsForPrefix(config, prefix);
    },
    async listObjects(prefix = "") {
      return listObjectsForPrefix(config, normalizeObjectKey(prefix));
    },
    async putObject({ contentType = "application/octet-stream", objectKey, bytes }) {
      const payload = Buffer.isBuffer(bytes) ? bytes : Buffer.from(bytes || "");
      const response = await signedFetch(config, {
        body: payload,
        contentType,
        method: "PUT",
        objectKey,
      });
      if (!response.ok) {
        return {
          bytesWritten: 0,
          message: `Storage upload failed with HTTP ${response.status}.`,
          ok: false,
          writeResult: "FAIL: Storage upload",
        };
      }
      return {
        bytesWritten: payload.length,
        message: `Uploaded ${objectKey}.`,
        ok: true,
        writeResult: "Stored",
      };
    },
    async readObject(objectKey) {
      const response = await signedFetch(config, {
        method: "GET",
        objectKey,
      });
      if (!response.ok) {
        return {
          bytes: Buffer.alloc(0),
          message: `Storage read failed with HTTP ${response.status}.`,
          ok: false,
        };
      }
      return {
        bytes: Buffer.from(await response.arrayBuffer()),
        contentType: response.headers.get("content-type") || "",
        message: `Read ${objectKey}.`,
        ok: true,
      };
    },
    async deleteObject(objectKey) {
      const response = await signedFetch(config, {
        method: "DELETE",
        objectKey,
      });
      if (!response.ok) {
        return {
          deleted: false,
          message: `Storage delete failed with HTTP ${response.status}.`,
          ok: false,
        };
      }
      return {
        deleted: true,
        message: `Deleted ${objectKey}.`,
        ok: true,
      };
    },
  };
}

export function createConfiguredProjectAssetStorage(env = process.env) {
  const config = loadStorageConfig(env);
  return config.configured ? createR2ProjectAssetStorage(config) : unconfiguredStorage(config);
}

export function createConfiguredBackupStorage(env = process.env) {
  const config = loadBackupStorageConfig(env);
  return config.configured ? createR2ProjectAssetStorage({
    ...config,
    projectsPrefix: config.backupPrefix,
  }) : unconfiguredStorage(config);
}

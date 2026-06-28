import { Buffer } from "node:buffer";

export const GFSP_PACKAGE_EXTENSION = ".gfsp";
export const GFSP_PACKAGE_TYPE = "Game Foundry Studio Project";
export const GFSP_PACKAGE_CONTRACT_VERSION = "1.0.0";
export const GFSP_PACKAGE_REQUIRED_FILES = Object.freeze([
  "metadata/package.json",
  "project/project.json",
  "assets/asset-references.json",
]);
export const GFSP_PACKAGE_FILENAME_PATTERN = "<ProjectNameWithoutSpaces>-<YYJJJ>-<sequence>.gfsp";

const ZIP_LOCAL_FILE_HEADER = 0x04034b50;
const ZIP_CENTRAL_DIRECTORY_HEADER = 0x02014b50;
const ZIP_END_OF_CENTRAL_DIRECTORY = 0x06054b50;
const ZIP_UTF8_FLAG = 0x0800;
const ZIP_STORE_METHOD = 0;
const CRC_TABLE = createCrcTable();

function createCrcTable() {
  const table = new Uint32Array(256);
  for (let index = 0; index < 256; index += 1) {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    table[index] = value >>> 0;
  }
  return table;
}

function crc32(buffer) {
  let value = 0xffffffff;
  for (const byte of buffer) {
    value = CRC_TABLE[(value ^ byte) & 0xff] ^ (value >>> 8);
  }
  return (value ^ 0xffffffff) >>> 0;
}

function dosDateTime(date = new Date()) {
  const year = Math.max(1980, date.getFullYear());
  const time = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const day = (year - 1980) << 9 | (date.getMonth() + 1) << 5 | date.getDate();
  return { day, time };
}

function normalizeZipPath(value) {
  return String(value || "").trim().replace(/\\/g, "/").replace(/^\/+/, "").replace(/\/{2,}/g, "/");
}

function encodeJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function createZipArchive(files, now = new Date()) {
  const localParts = [];
  const centralParts = [];
  const { day, time } = dosDateTime(now);
  let offset = 0;

  files.forEach((file) => {
    const name = Buffer.from(normalizeZipPath(file.path), "utf8");
    const bytes = Buffer.isBuffer(file.bytes) ? file.bytes : Buffer.from(String(file.contents || ""), "utf8");
    const checksum = crc32(bytes);

    const localHeader = Buffer.alloc(30 + name.length);
    localHeader.writeUInt32LE(ZIP_LOCAL_FILE_HEADER, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(ZIP_UTF8_FLAG, 6);
    localHeader.writeUInt16LE(ZIP_STORE_METHOD, 8);
    localHeader.writeUInt16LE(time, 10);
    localHeader.writeUInt16LE(day, 12);
    localHeader.writeUInt32LE(checksum, 14);
    localHeader.writeUInt32LE(bytes.length, 18);
    localHeader.writeUInt32LE(bytes.length, 22);
    localHeader.writeUInt16LE(name.length, 26);
    name.copy(localHeader, 30);

    const centralHeader = Buffer.alloc(46 + name.length);
    centralHeader.writeUInt32LE(ZIP_CENTRAL_DIRECTORY_HEADER, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(ZIP_UTF8_FLAG, 8);
    centralHeader.writeUInt16LE(ZIP_STORE_METHOD, 10);
    centralHeader.writeUInt16LE(time, 12);
    centralHeader.writeUInt16LE(day, 14);
    centralHeader.writeUInt32LE(checksum, 16);
    centralHeader.writeUInt32LE(bytes.length, 20);
    centralHeader.writeUInt32LE(bytes.length, 24);
    centralHeader.writeUInt16LE(name.length, 28);
    centralHeader.writeUInt32LE(offset, 42);
    name.copy(centralHeader, 46);

    localParts.push(localHeader, bytes);
    centralParts.push(centralHeader);
    offset += localHeader.length + bytes.length;
  });

  const centralDirectorySize = centralParts.reduce((total, part) => total + part.length, 0);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(ZIP_END_OF_CENTRAL_DIRECTORY, 0);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(centralDirectorySize, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...localParts, ...centralParts, end]);
}

function findEndOfCentralDirectory(bytes) {
  const minimumOffset = Math.max(0, bytes.length - 65557);
  for (let offset = bytes.length - 22; offset >= minimumOffset; offset -= 1) {
    if (bytes.readUInt32LE(offset) === ZIP_END_OF_CENTRAL_DIRECTORY) {
      return offset;
    }
  }
  return -1;
}

function readZipArchive(bytes) {
  const endOffset = findEndOfCentralDirectory(bytes);
  if (endOffset < 0) {
    throw new Error("Package integrity check failed: ZIP central directory was not found.");
  }
  const entryCount = bytes.readUInt16LE(endOffset + 10);
  let centralOffset = bytes.readUInt32LE(endOffset + 16);
  const files = new Map();

  for (let index = 0; index < entryCount; index += 1) {
    if (bytes.readUInt32LE(centralOffset) !== ZIP_CENTRAL_DIRECTORY_HEADER) {
      throw new Error("Package integrity check failed: invalid ZIP central directory entry.");
    }
    const method = bytes.readUInt16LE(centralOffset + 10);
    const expectedCrc = bytes.readUInt32LE(centralOffset + 16);
    const compressedSize = bytes.readUInt32LE(centralOffset + 20);
    const uncompressedSize = bytes.readUInt32LE(centralOffset + 24);
    const nameLength = bytes.readUInt16LE(centralOffset + 28);
    const extraLength = bytes.readUInt16LE(centralOffset + 30);
    const commentLength = bytes.readUInt16LE(centralOffset + 32);
    const localOffset = bytes.readUInt32LE(centralOffset + 42);
    const name = bytes.subarray(centralOffset + 46, centralOffset + 46 + nameLength).toString("utf8");

    if (method !== ZIP_STORE_METHOD || compressedSize !== uncompressedSize) {
      throw new Error(`Package integrity check failed: ${name} uses unsupported ZIP compression.`);
    }
    if (bytes.readUInt32LE(localOffset) !== ZIP_LOCAL_FILE_HEADER) {
      throw new Error(`Package integrity check failed: ${name} has an invalid local file header.`);
    }
    const localNameLength = bytes.readUInt16LE(localOffset + 26);
    const localExtraLength = bytes.readUInt16LE(localOffset + 28);
    const dataStart = localOffset + 30 + localNameLength + localExtraLength;
    const data = bytes.subarray(dataStart, dataStart + uncompressedSize);
    if (crc32(data) !== expectedCrc) {
      throw new Error(`Package integrity check failed: ${name} checksum mismatch.`);
    }
    files.set(normalizeZipPath(name), data);
    centralOffset += 46 + nameLength + extraLength + commentLength;
  }

  return files;
}

function julianCode(now = new Date()) {
  const start = Date.UTC(now.getUTCFullYear(), 0, 0);
  const day = Math.floor((Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - start) / 86400000);
  return `${String(now.getUTCFullYear()).slice(-2)}${String(day).padStart(3, "0")}`;
}

function filenameProjectName(name) {
  return String(name || "Project")
    .replace(/\s+/g, "")
    .replace(/[^A-Za-z0-9_-]/g, "") || "Project";
}

export function projectPackageFilename(projectName, { now = new Date(), sequence = 1 } = {}) {
  return `${filenameProjectName(projectName)}-${julianCode(now)}-${String(sequence).padStart(3, "0")}${GFSP_PACKAGE_EXTENSION}`;
}

function createCheck(id, status, message) {
  return { id, message, status };
}

function parseJsonFile(files, filePath) {
  const bytes = files.get(filePath);
  if (!bytes) {
    return null;
  }
  return JSON.parse(bytes.toString("utf8"));
}

function normalizeAssetReference(row = {}) {
  const storageObjectKey = String(row.storageObjectKey || row.storedPath || "").trim();
  return {
    assetId: String(row.assetId || row.id || row.key || "").trim(),
    fileName: String(row.originalName || row.fileName || "").trim(),
    mimeType: String(row.mimeType || "").trim(),
    size: Number(row.size || 0),
    storageObjectKey,
    storedPath: String(row.storedPath || storageObjectKey).trim(),
  };
}

function existingProjectConflicts(metadata, existingProjects = []) {
  const project = metadata?.project || {};
  return existingProjects.filter((record) => (
    (project.projectKey && record.projectKey === project.projectKey)
    || (project.localRecordId && record.localRecordId === project.localRecordId)
    || (project.name && record.name === project.name)
  ));
}

export function createProjectPackage({
  assetReferences = [],
  existingProjects = [],
  now = new Date(),
  project,
  sequence = 1,
} = {}) {
  const filename = projectPackageFilename(project?.name || "Project", { now, sequence });
  const normalizedAssetReferences = assetReferences.map(normalizeAssetReference);
  const metadata = {
    assetReferenceCount: normalizedAssetReferences.length,
    contractVersion: GFSP_PACKAGE_CONTRACT_VERSION,
    createdAt: now.toISOString(),
    extension: GFSP_PACKAGE_EXTENSION,
    filename,
    filenameFormat: GFSP_PACKAGE_FILENAME_PATTERN,
    packageType: GFSP_PACKAGE_TYPE,
    project: {
      localRecordId: String(project?.localRecordId || project?.id || "").trim(),
      name: String(project?.name || "Untitled Project").trim(),
      ownerKey: String(project?.ownerKey || "").trim(),
      projectKey: String(project?.projectKey || "").trim(),
      status: String(project?.status || "Planning").trim(),
    },
    requiredFiles: GFSP_PACKAGE_REQUIRED_FILES,
    source: "Local API",
  };
  const projectPayload = {
    localRecordId: metadata.project.localRecordId,
    name: metadata.project.name,
    ownerKey: metadata.project.ownerKey,
    projectKey: metadata.project.projectKey,
    status: metadata.project.status,
  };
  const files = [
    { path: "metadata/package.json", contents: encodeJson(metadata) },
    { path: "project/project.json", contents: encodeJson(projectPayload) },
    { path: "assets/asset-references.json", contents: encodeJson({ assetReferences: normalizedAssetReferences }) },
  ];
  const zipBytes = createZipArchive(files, now);
  const packageBytesBase64 = zipBytes.toString("base64");
  const validation = validateProjectPackage({
    existingProjects,
    fileName: filename,
    packageBytesBase64,
  });
  return {
    byteLength: zipBytes.length,
    fileCount: files.length,
    files: files.map((file) => file.path),
    filename,
    metadata,
    packageBytesBase64,
    status: validation.status,
    validation,
  };
}

export function validateProjectPackage({
  existingProjects = [],
  fileName = "",
  packageBytesBase64 = "",
} = {}) {
  const checks = [];
  const normalizedFileName = String(fileName || "").trim();
  if (!normalizedFileName.endsWith(GFSP_PACKAGE_EXTENSION)) {
    checks.push(createCheck("filename-extension", "FAIL", "Select a .gfsp package file."));
  } else {
    checks.push(createCheck("filename-extension", "PASS", `${normalizedFileName} uses the .gfsp extension.`));
  }
  if (!packageBytesBase64) {
    checks.push(createCheck("package-bytes", "FAIL", "Package bytes were not provided through the Local API request."));
    return {
      checks,
      conflicts: [],
      message: "Validate Project Package failed: select a .gfsp package before validating. No import performed.",
      metadata: null,
      status: "FAIL",
      valid: false,
    };
  }

  let files;
  try {
    files = readZipArchive(Buffer.from(packageBytesBase64, "base64"));
    checks.push(createCheck("package-integrity", "PASS", "ZIP integrity and checksums passed."));
  } catch (error) {
    checks.push(createCheck("package-integrity", "FAIL", error instanceof Error ? error.message : "ZIP integrity check failed."));
    return {
      checks,
      conflicts: [],
      message: "Validate Project Package failed package integrity checks. No import performed.",
      metadata: null,
      status: "FAIL",
      valid: false,
    };
  }

  GFSP_PACKAGE_REQUIRED_FILES.forEach((requiredFile) => {
    checks.push(createCheck(
      `required-file:${requiredFile}`,
      files.has(requiredFile) ? "PASS" : "FAIL",
      files.has(requiredFile) ? `${requiredFile} is present.` : `${requiredFile} is missing.`,
    ));
  });

  let metadata = null;
  let project = null;
  let assetReferences = [];
  try {
    metadata = parseJsonFile(files, "metadata/package.json");
    project = parseJsonFile(files, "project/project.json");
    const assetPayload = parseJsonFile(files, "assets/asset-references.json");
    assetReferences = Array.isArray(assetPayload?.assetReferences) ? assetPayload.assetReferences : [];
    checks.push(createCheck("schema-json", "PASS", "Required JSON package files parsed successfully."));
  } catch (error) {
    checks.push(createCheck("schema-json", "FAIL", error instanceof Error ? error.message : "Package JSON schema parsing failed."));
  }

  const metadataValid = metadata?.packageType === GFSP_PACKAGE_TYPE
    && metadata?.extension === GFSP_PACKAGE_EXTENSION
    && metadata?.contractVersion === GFSP_PACKAGE_CONTRACT_VERSION
    && metadata?.filenameFormat === GFSP_PACKAGE_FILENAME_PATTERN
    && metadata?.project?.projectKey
    && metadata?.project?.name;
  checks.push(createCheck(
    "metadata-contract",
    metadataValid ? "PASS" : "FAIL",
    metadataValid ? "Package metadata contract is valid." : "Package metadata must include type, extension, contractVersion, filenameFormat, projectKey, and project name.",
  ));

  const projectValid = Boolean(project?.projectKey && project?.name && project?.localRecordId);
  checks.push(createCheck(
    "project-schema",
    projectValid ? "PASS" : "FAIL",
    projectValid ? "Project payload schema is valid." : "Project payload requires projectKey, localRecordId, and name.",
  ));

  const compatibilityPass = metadata?.contractVersion === GFSP_PACKAGE_CONTRACT_VERSION;
  checks.push(createCheck(
    "compatibility",
    compatibilityPass ? "PASS" : "FAIL",
    compatibilityPass ? `Package contract ${GFSP_PACKAGE_CONTRACT_VERSION} is compatible.` : `Package contract must be ${GFSP_PACKAGE_CONTRACT_VERSION}.`,
  ));

  const assetReferencesValid = assetReferences.every((asset) => (
    asset && typeof asset === "object" && String(asset.storageObjectKey || asset.storedPath || "").trim()
  ));
  checks.push(createCheck(
    "asset-references",
    assetReferencesValid ? "PASS" : "FAIL",
    assetReferencesValid
      ? `Asset references verified: ${assetReferences.length} storage object key(s).`
      : "Every asset reference must include a storageObjectKey or storedPath.",
  ));

  const conflicts = existingProjectConflicts(metadata, existingProjects);
  if (conflicts.length) {
    checks.push(createCheck("existing-project-conflicts", "WARN", `${conflicts.length} existing project conflict(s) detected; import requires Replace Existing confirmation or Import As New Project.`));
  } else {
    checks.push(createCheck("existing-project-conflicts", "PASS", "No existing project conflicts detected."));
  }

  const failed = checks.some((check) => check.status === "FAIL");
  return {
    assetReferenceCount: assetReferences.length,
    checks,
    conflicts,
    message: failed
      ? "Validate Project Package failed. No import performed."
      : "Validate Project Package passed integrity, required file, schema, compatibility, and asset reference checks. No import performed.",
    metadata,
    status: failed ? "FAIL" : "PASS",
    valid: !failed,
  };
}

export function projectPackageReadinessContract() {
  return {
    contractVersion: GFSP_PACKAGE_CONTRACT_VERSION,
    extension: GFSP_PACKAGE_EXTENSION,
    filenameFormat: GFSP_PACKAGE_FILENAME_PATTERN,
    packageType: GFSP_PACKAGE_TYPE,
    requiredFiles: GFSP_PACKAGE_REQUIRED_FILES,
    zipBased: true,
  };
}

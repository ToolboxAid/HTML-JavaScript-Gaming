import { fileMatchesAccept, labelForKind } from "../assetManagerMetadata.js";

const ASSET_ID_PATTERN = /^assets\.([a-z0-9-]+)\.([a-z0-9-]+)\.([a-z0-9-]+(?:\.[a-z0-9-]+)*)$/;
const BEZEL_ASSET_ID_PATTERN = /^assets\.image\.bezel\.[a-z0-9-]+(?:\.[a-z0-9-]+)*$/;
const DEFAULT_BEZEL_STRETCH_PX = 10;

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function parseAssetId(assetId) {
  const match = ASSET_ID_PATTERN.exec(String(assetId || ""));
  return match
    ? { type: match[1], role: match[2], filenamePart: match[3] }
    : null;
}

export class AssetSchemaValidator {
  constructor({ fetchRef = globalThis.fetch?.bind(globalThis), schemaUrl }) {
    this.fetchRef = fetchRef;
    this.schemaUrl = schemaUrl;
    this.schema = null;
    this.allowedTypes = [];
    this.allowedKinds = [];
    this.allowedRoles = [];
    this.kindsByType = {};
    this.rolesByType = {};
    this.allowedSources = [];
    this.assetIdPatterns = [];
  }

  async load() {
    try {
      if (typeof this.fetchRef !== "function") {
        return { ok: false, message: "Fetch API is unavailable; schema validation cannot start." };
      }
      const response = await this.fetchRef(this.schemaUrl, { cache: "no-store" });
      if (!response.ok) {
        return { ok: false, message: `Unable to load ${this.schemaUrl}: ${response.status}` };
      }
      this.schema = await response.json();
      this.allowedTypes = this.readEnum("#/$defs/assetEntry/properties/type");
      this.allowedKinds = this.readEnum("#/$defs/assetEntry/properties/kind");
      this.allowedRoles = this.readEnum("#/$defs/assetEntry/properties/role");
      this.kindsByType = this.readStringArrayMap("#/$defs/assetKindsByType");
      this.rolesByType = this.readStringArrayMap("#/$defs/assetRolesByType");
      this.allowedSources = this.readEnum("#/$defs/assetEntry/properties/source");
      this.assetIdPatterns = this.readAssetIdPatterns();
      if (!this.allowedTypes.length || !this.allowedKinds.length || !this.allowedRoles.length || !Object.keys(this.rolesByType).length || !this.assetIdPatterns.length) {
        return { ok: false, message: "asset-browser.schema.json is missing asset type, kind, or role rules." };
      }
      return { ok: true };
    } catch (error) {
      return { ok: false, message: `Unable to load asset-browser.schema.json: ${error.message}` };
    }
  }

  readEnum(pointer) {
    const node = this.resolvePointer(pointer);
    return Array.isArray(node?.enum) ? node.enum.map(String) : [];
  }

  readAssetIdPatterns() {
    const patternNodes = this.resolvePointer("#/properties/assets/propertyNames/anyOf");
    if (!Array.isArray(patternNodes)) {
      return [];
    }
    return patternNodes
      .map((node) => node?.pattern)
      .filter((pattern) => typeof pattern === "string" && pattern.length > 0)
      .map((pattern) => new RegExp(pattern));
  }

  readStringArrayMap(pointer) {
    const node = this.resolvePointer(pointer);
    if (!isPlainObject(node)) {
      return {};
    }
    return Object.fromEntries(Object.entries(node)
      .filter(([, roles]) => Array.isArray(roles))
      .map(([kind, roles]) => [kind, roles.map(String)]));
  }

  resolvePointer(pointer) {
    if (!this.schema || pointer === "#") {
      return this.schema;
    }
    if (!pointer.startsWith("#/")) {
      return undefined;
    }
    return pointer
      .slice(2)
      .split("/")
      .map((segment) => segment.replace(/~1/g, "/").replace(/~0/g, "~"))
      .reduce((node, key) => (node && typeof node === "object" ? node[key] : undefined), this.schema);
  }

  createEntry({ assetId, kind, path, role, stretchOverride, type }) {
    const entry = {
      path,
      type,
      kind,
      role,
      source: "asset-manager-v2"
    };
    if (role === "bezel") {
      const uniformEdgeStretchPx = Number(stretchOverride?.uniformEdgeStretchPx);
      entry.stretchOverride = {
        uniformEdgeStretchPx: Number.isFinite(uniformEdgeStretchPx) ? uniformEdgeStretchPx : DEFAULT_BEZEL_STRETCH_PX
      };
    }
    const validation = this.validateAssetEntry(assetId, entry, `assets.${assetId || "(empty)"}`);
    return validation.ok
      ? { ok: true, entry }
      : { ok: false, errors: validation.errors };
  }

  validateFileSelection(formValue, fileInfo) {
    if (!fileInfo) {
      return { ok: true };
    }
    if (fileInfo.type !== formValue.type) {
      return { ok: false, errors: [`Selected file type "${fileInfo.type}" does not match active type "${formValue.type}".`] };
    }
    if (!fileMatchesAccept(formValue.type, { name: fileInfo.name, type: fileInfo.mimeType || "" })) {
      return { ok: false, errors: [`File ${fileInfo.name} is not accepted for ${labelForKind(formValue.type)} assets.`] };
    }
    return this.createEntry(formValue);
  }

  validatePayload(payload) {
    const errors = [];
    if (!isPlainObject(payload)) {
      return { ok: false, errors: ["Asset payload must be an object."] };
    }
    const allowedRootKeys = new Set(Object.keys(this.schema?.properties || {}));
    for (const key of Object.keys(payload)) {
      if (!allowedRootKeys.has(key)) {
        errors.push(`Root field "${key}" is not allowed by asset-browser.schema.json.`);
      }
    }
    if (!Object.prototype.hasOwnProperty.call(payload, "assets")) {
      errors.push("assets is required by asset-browser.schema.json.");
    }
    if (!isPlainObject(payload.assets)) {
      errors.push("assets must be an object keyed by id.");
    }
    if (errors.length) {
      return { ok: false, errors };
    }

    for (const [assetId, entry] of Object.entries(payload.assets)) {
      errors.push(...this.validateAssetEntry(assetId, entry, `assets.${assetId}`).errors);
    }
    return errors.length
      ? { ok: false, errors }
      : { ok: true, payload: { ...clone(payload), assets: clone(payload.assets) } };
  }

  validateAssetEntry(assetId, entry, pointer) {
    const errors = [];
    const assetIdParts = parseAssetId(assetId);
    if (typeof assetId !== "string" || !assetId.trim()) {
      errors.push(`${pointer}: id is required.`);
    } else if (!this.assetIdPatterns.some((pattern) => pattern.test(assetId))) {
      errors.push(`${pointer}: Unsupported id. Expected assets.<type>.<role>.<filenamePart>. Allowed types: ${this.allowedTypes.join(", ")}.`);
    }
    if (!isPlainObject(entry)) {
      return { ok: false, errors: [...errors, `${pointer}: asset entry must be an object.`] };
    }

    const allowedEntryKeys = new Set(["path", "type", "kind", "role", "source", "stretchOverride"]);
    for (const key of Object.keys(entry)) {
      if (!allowedEntryKeys.has(key)) {
        errors.push(`${pointer}.${key}: field is not allowed by asset-browser.schema.json.`);
      }
    }
    if (typeof entry.path !== "string" || !entry.path.trim()) {
      errors.push(`${pointer}.path: path is required.`);
    }
    if (!this.allowedTypes.includes(entry.type)) {
      errors.push(`${pointer}.type: Unsupported asset type "${entry.type}".`);
    }
    if (!this.allowedKinds.includes(entry.kind)) {
      errors.push(`${pointer}.kind: Unsupported asset kind/format "${entry.kind}".`);
    }
    const kindsForType = this.kindsByType[entry.type] || [];
    if (kindsForType.length && !kindsForType.includes(entry.kind)) {
      errors.push(`${pointer}.kind: kind "${entry.kind}" is not allowed for ${entry.type} assets.`);
    }
    if (!Object.prototype.hasOwnProperty.call(entry, "role") || typeof entry.role !== "string" || !entry.role.trim()) {
      errors.push(`${pointer}.role: role is required.`);
    } else {
      if (!this.allowedRoles.includes(entry.role)) {
        errors.push(`${pointer}.role: Unsupported asset role "${entry.role}".`);
      }
      const rolesForType = this.rolesByType[entry.type] || [];
      if (rolesForType.length && !rolesForType.includes(entry.role)) {
        errors.push(`${pointer}.role: role "${entry.role}" is not allowed for ${entry.type} assets.`);
      }
      if (entry.role === "bezel" && !BEZEL_ASSET_ID_PATTERN.test(assetId)) {
        errors.push(`${pointer}.role: bezel role requires an assets.image.bezel.* id.`);
      }
    }
    if (assetIdParts && entry.type && assetIdParts.type !== entry.type) {
      errors.push(`${pointer}.type: type must match the id type segment.`);
    }
    if (assetIdParts && entry.role && assetIdParts.role !== entry.role) {
      errors.push(`${pointer}.role: role must match the id role segment.`);
    }
    if (!this.allowedSources.includes(entry.source)) {
      errors.push(`${pointer}.source: Unsupported asset source "${entry.source}".`);
    }
    if (Object.prototype.hasOwnProperty.call(entry, "stretchOverride")) {
      if (!BEZEL_ASSET_ID_PATTERN.test(assetId)) {
        errors.push(`${pointer}.stretchOverride: stretchOverride is only allowed on assets.image.bezel.* assets.`);
      }
      if (!isPlainObject(entry.stretchOverride) || !Number.isFinite(entry.stretchOverride.uniformEdgeStretchPx) || entry.stretchOverride.uniformEdgeStretchPx < 0) {
        errors.push(`${pointer}.stretchOverride.uniformEdgeStretchPx: value must be a number greater than or equal to 0.`);
      }
    }
    return { ok: errors.length === 0, errors };
  }
}

import { fileMatchesAccept, labelForKind } from "../assetManagerMetadata.js";

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export class AssetSchemaValidator {
  constructor({ fetchRef = globalThis.fetch?.bind(globalThis), schemaUrl }) {
    this.fetchRef = fetchRef;
    this.schemaUrl = schemaUrl;
    this.schema = null;
    this.allowedKinds = [];
    this.allowedRoles = [];
    this.rolesByKind = {};
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
      this.allowedKinds = this.readEnum("#/$defs/assetEntry/properties/kind");
      this.allowedRoles = this.readEnum("#/$defs/assetEntry/properties/role");
      this.rolesByKind = this.readRolesByKind();
      this.allowedSources = this.readEnum("#/$defs/assetEntry/properties/source");
      this.assetIdPatterns = this.readAssetIdPatterns();
      if (!this.allowedKinds.length || !this.allowedRoles.length || !Object.keys(this.rolesByKind).length || !this.assetIdPatterns.length) {
        return { ok: false, message: "asset-browser.schema.json is missing approved asset kind or role rules." };
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

  readRolesByKind() {
    const node = this.resolvePointer("#/$defs/assetRolesByKind");
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

  createEntry({ assetId, kind, path, role }) {
    const entry = {
      path,
      kind,
      role,
      source: "asset-manager-v2"
    };
    const validation = this.validateAssetEntry(assetId, entry, `assets.${assetId || "(empty)"}`);
    return validation.ok
      ? { ok: true, entry }
      : { ok: false, errors: validation.errors };
  }

  validateFileSelection(formValue, fileInfo) {
    if (!fileInfo) {
      return { ok: true };
    }
    if (fileInfo.kind !== formValue.kind) {
      return { ok: false, errors: [`Selected file kind "${fileInfo.kind}" does not match active kind "${formValue.kind}".`] };
    }
    if (!fileMatchesAccept(formValue.kind, fileInfo)) {
      return { ok: false, errors: [`File ${fileInfo.name} is not accepted for ${labelForKind(formValue.kind)} assets.`] };
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
      errors.push("assets must be an object keyed by approved asset id.");
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
    if (typeof assetId !== "string" || !assetId.trim()) {
      errors.push(`${pointer}: asset id is required.`);
    } else if (!this.assetIdPatterns.some((pattern) => pattern.test(assetId))) {
      errors.push(`${pointer}: Unsupported asset id or kind. Allowed kinds: ${this.allowedKinds.join(", ")}.`);
    }
    if (!isPlainObject(entry)) {
      return { ok: false, errors: [...errors, `${pointer}: asset entry must be an object.`] };
    }

    const allowedEntryKeys = new Set(["path", "kind", "role", "source", "stretchOverride"]);
    for (const key of Object.keys(entry)) {
      if (!allowedEntryKeys.has(key)) {
        errors.push(`${pointer}.${key}: field is not allowed by asset-browser.schema.json.`);
      }
    }
    if (typeof entry.path !== "string" || !entry.path.trim()) {
      errors.push(`${pointer}.path: path is required.`);
    }
    if (!this.allowedKinds.includes(entry.kind)) {
      errors.push(`${pointer}.kind: Unsupported asset kind "${entry.kind}".`);
    }
    if (!Object.prototype.hasOwnProperty.call(entry, "role") || typeof entry.role !== "string" || !entry.role.trim()) {
      errors.push(`${pointer}.role: role is required.`);
    } else {
      if (!this.allowedRoles.includes(entry.role)) {
        errors.push(`${pointer}.role: Unsupported asset role "${entry.role}".`);
      }
      const rolesForKind = this.rolesByKind[entry.kind] || [];
      if (rolesForKind.length && !rolesForKind.includes(entry.role)) {
        errors.push(`${pointer}.role: role "${entry.role}" is not allowed for ${entry.kind} assets.`);
      }
      if (entry.role === "bezel" && !/^image\.[a-z0-9-]+\.[a-z0-9-]+(?:\.[a-z0-9-]+)*\.bezel$/.test(assetId)) {
        errors.push(`${pointer}.role: bezel role requires an image asset id ending in .bezel.`);
      }
    }
    if (typeof assetId === "string" && entry.kind && !assetId.startsWith(`${entry.kind}.`)) {
      errors.push(`${pointer}.kind: kind must match the asset id prefix.`);
    }
    if (!this.allowedSources.includes(entry.source)) {
      errors.push(`${pointer}.source: Unsupported asset source "${entry.source}".`);
    }
    if (Object.prototype.hasOwnProperty.call(entry, "stretchOverride")) {
      if (!/^image\.[a-z0-9-]+\.[a-z0-9-]+(?:\.[a-z0-9-]+)*\.bezel$/.test(assetId)) {
        errors.push(`${pointer}.stretchOverride: stretchOverride is only allowed on image.*.bezel assets.`);
      }
      if (!isPlainObject(entry.stretchOverride) || !Number.isFinite(entry.stretchOverride.uniformEdgeStretchPx) || entry.stretchOverride.uniformEdgeStretchPx < 0) {
        errors.push(`${pointer}.stretchOverride.uniformEdgeStretchPx: value must be a number greater than or equal to 0.`);
      }
    }
    return { ok: errors.length === 0, errors };
  }
}

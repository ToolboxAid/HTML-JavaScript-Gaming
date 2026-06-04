import {
  applyObjectVectorCanvasTransform,
  combineObjectVectorBounds,
  normalizeObjectVectorOrigin,
  normalizeObjectVectorTransform,
  objectVectorBoundsCornerPoints,
  transformedObjectVectorShapeBounds,
  objectVectorSvgTransformAttribute
} from "./OrientationTransform.js";
import { createWorldScreenTransform } from "./WorldScreenTransform.js";
import { isPlainObject } from "../../shared/object/objects.js";
import { deepClone } from "../../shared/json/clone.js";

const DEFAULT_SCHEMA_URL = new URL("../../shared/schemas/tools/object-vector-studio-v2.schema.json", import.meta.url);
const OBJECT_VECTOR_TOOL_ID = "object-vector-studio-v2";

function isObjectIdentityId(value) {
  return /^object\.[a-z0-9-]+\.[a-z0-9][a-z0-9-]*$/.test(String(value || ""));
}

function typeMatches(expectedType, value) {
  if (expectedType === "array") {
    return Array.isArray(value);
  }
  if (expectedType === "object") {
    return isPlainObject(value);
  }
  if (expectedType === "integer") {
    return Number.isInteger(value);
  }
  if (expectedType === "number") {
    return typeof value === "number" && Number.isFinite(value);
  }
  return typeof value === expectedType;
}

function typeDescription(expectedType) {
  if (expectedType === "boolean") {
    return "true or false";
  }
  return expectedType === "object" ? "an object" : `a ${expectedType}`;
}

function resolveSchemaRef(schemaRoot, ref) {
  if (typeof ref !== "string" || !ref.startsWith("#/")) {
    throw new Error(`unsupported schema reference ${ref || "unknown"}`);
  }
  return ref.slice(2).split("/").reduce((current, segment) => current?.[segment], schemaRoot);
}

function normalizeManifestPayload(manifestPayload) {
  const manifest = isPlainObject(manifestPayload) ? manifestPayload : {};
  const workspace = isPlainObject(manifest.workspace) ? manifest.workspace : manifest;
  const tools = isPlainObject(manifest.tools)
    ? manifest.tools
    : workspace?.tools;
  return isPlainObject(tools?.[OBJECT_VECTOR_TOOL_ID])
    ? tools[OBJECT_VECTOR_TOOL_ID]
    : null;
}

function normalizeString(value) {
  return String(value || "").trim();
}

function normalizeTags(value) {
  return Array.isArray(value)
    ? value.map((tag) => normalizeString(tag).toLowerCase()).filter(Boolean)
    : [];
}

function objectHasTags(object, tags) {
  const tagSet = new Set(normalizeTags(object?.tags));
  return tags.every((tag) => tagSet.has(tag));
}

function objectHasOldSignal(object) {
  const text = [
    object?.id,
    object?.name,
    ...(Array.isArray(object?.tags) ? object.tags : []),
  ].map((value) => normalizeString(value).toLowerCase()).join(" ");
  return /(^|[.\s_-])(old|legacy|deprecated|archive|archived|renamed|stale)($|[.\s_-])/.test(text);
}

function taggedCandidateLabel(candidate) {
  const tags = normalizeTags(candidate.object?.tags).join(",");
  const oldLabel = candidate.oldSignal ? " old-signal" : "";
  return `${candidate.object?.id || "unknown"} tags=[${tags}] index=${candidate.index}${oldLabel}`;
}

function selectTaggedCandidate(candidates) {
  return [...candidates].sort((left, right) => {
    if (left.oldSignal !== right.oldSignal) {
      return left.oldSignal ? 1 : -1;
    }
    return right.index - left.index;
  })[0] || null;
}

function sortedShapes(object) {
  return [...(object?.shapes || [])].sort((left, right) => left.order - right.order);
}

function sortedFrames(state) {
  return [...(state?.frames || [])].sort((left, right) => left.order - right.order);
}

function shapeTool(shape) {
  return String(shape?.tool || "").trim().toLowerCase();
}

function shapeGeometryTool(shape) {
  const tool = shapeTool(shape);
  if (tool === "triangle") {
    return "polygon";
  }
  if (tool === "square") {
    return "rectangle";
  }
  return tool;
}

function shapeTransform(shape) {
  return normalizeObjectVectorTransform(shape?.transform);
}

function objectTransformOrigin(object) {
  return normalizeObjectVectorOrigin(object?.objectOrigin);
}

function pointStyleValue(value) {
  return value === "round" ? "round" : "square";
}

function strokeLineJoinValue(value) {
  return pointStyleValue(value) === "round" ? "round" : "miter";
}

function shapeRoundingRadius(shape) {
  const value = Number(shape?.style?.roundingRadius);
  return Number.isFinite(value) && value >= 0 ? value : 4;
}

function shapeGeometryPoints(shape) {
  const geometryTool = shapeGeometryTool(shape);
  if (geometryTool === "rectangle") {
    const x = Number(shape.geometry.x) || 0;
    const y = Number(shape.geometry.y) || 0;
    const width = Number(shape.geometry.width) || 0;
    const height = Number(shape.geometry.height) || 0;
    return [
      { x, y },
      { x: x + width, y },
      { x: x + width, y: y + height },
      { x, y: y + height }
    ];
  }
  if (geometryTool === "polygon" || geometryTool === "polyline") {
    return Array.isArray(shape?.geometry?.points) ? shape.geometry.points : [];
  }
  return [];
}

function shapePointRoundingValues(shape) {
  const points = shapeGeometryPoints(shape);
  if (!points.length) {
    return [];
  }
  const explicit = Array.isArray(shape?.style?.pointRounding) ? shape.style.pointRounding : null;
  if (explicit) {
    return Array.from({ length: points.length }, (_, index) => explicit[index] === true);
  }
  return Array.from({ length: points.length }, () => false);
}

function roundedPointPathCommands(shape, { closed } = {}) {
  const geometryTool = shapeGeometryTool(shape);
  if (!["polygon", "polyline", "rectangle"].includes(geometryTool)) {
    return [];
  }
  const sourcePoints = shapeGeometryPoints(shape);
  const pointCount = sourcePoints.length;
  if (pointCount < 3) {
    return [];
  }
  const pointRounding = shapePointRoundingValues(shape);
  const hasRoundedPoint = pointRounding.some((isRounded, index) => isRounded === true && (closed || (index > 0 && index < pointCount - 1)));
  const radius = shapeRoundingRadius(shape);
  if (!hasRoundedPoint || radius <= 0) {
    return [];
  }
  const points = sourcePoints.map((point) => ({
    x: Number(point.x) || 0,
    y: Number(point.y) || 0
  }));
  const roundedVertex = (index) => {
    if (pointRounding[index] !== true || (!closed && (index === 0 || index === pointCount - 1))) {
      return null;
    }
    const previous = points[index === 0 ? pointCount - 1 : index - 1];
    const current = points[index];
    const next = points[index === pointCount - 1 ? 0 : index + 1];
    const previousDistance = Math.hypot(previous.x - current.x, previous.y - current.y);
    const nextDistance = Math.hypot(next.x - current.x, next.y - current.y);
    if (previousDistance <= 0 || nextDistance <= 0) {
      return null;
    }
    const vertexRadius = Math.min(radius, previousDistance / 2, nextDistance / 2);
    if (vertexRadius <= 0) {
      return null;
    }
    return {
      after: {
        x: current.x + ((next.x - current.x) / nextDistance) * vertexRadius,
        y: current.y + ((next.y - current.y) / nextDistance) * vertexRadius
      },
      before: {
        x: current.x + ((previous.x - current.x) / previousDistance) * vertexRadius,
        y: current.y + ((previous.y - current.y) / previousDistance) * vertexRadius
      },
      current
    };
  };
  const commands = [];
  const appendVertex = (index) => {
    const rounded = roundedVertex(index);
    if (!rounded) {
      commands.push({ point: points[index], type: "line" });
      return;
    }
    commands.push({ point: rounded.before, type: "line" });
    commands.push({ control: rounded.current, point: rounded.after, type: "quadratic" });
  };
  if (closed) {
    commands.push({ point: roundedVertex(0)?.after || points[0], type: "move" });
    for (let index = 1; index < pointCount; index += 1) {
      appendVertex(index);
    }
    appendVertex(0);
    commands.push({ type: "close" });
    return commands;
  }
  commands.push({ point: points[0], type: "move" });
  for (let index = 1; index < pointCount - 1; index += 1) {
    appendVertex(index);
  }
  commands.push({ point: points[pointCount - 1], type: "line" });
  return commands;
}

function applyRuntimePathCommands(context, commands) {
  commands.forEach((command) => {
    if (command.type === "move") {
      context.moveTo(command.point.x, command.point.y);
    } else if (command.type === "line") {
      context.lineTo(command.point.x, command.point.y);
    } else if (command.type === "quadratic") {
      context.quadraticCurveTo(command.control.x, command.control.y, command.point.x, command.point.y);
    } else if (command.type === "close") {
      context.closePath();
    }
  });
}

function formatSvgNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? String(Math.round(parsed * 1000) / 1000) : "0";
}

function runtimePathCommandsToSvgPath(commands) {
  return commands.map((command) => {
    if (command.type === "move") {
      return `M ${formatSvgNumber(command.point.x)} ${formatSvgNumber(command.point.y)}`;
    }
    if (command.type === "line") {
      return `L ${formatSvgNumber(command.point.x)} ${formatSvgNumber(command.point.y)}`;
    }
    if (command.type === "quadratic") {
      return `Q ${formatSvgNumber(command.control.x)} ${formatSvgNumber(command.control.y)} ${formatSvgNumber(command.point.x)} ${formatSvgNumber(command.point.y)}`;
    }
    return "Z";
  }).join(" ");
}

function normalizeFill(value) {
  return value && value !== "transparent" ? value : null;
}

function normalizeStroke(value) {
  return value && value !== "transparent" ? value : null;
}

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function shapeBounds(shape) {
  const geometryTool = shapeGeometryTool(shape);
  if (geometryTool === "rectangle") {
    return {
      height: shape.geometry.height,
      width: shape.geometry.width,
      x: shape.geometry.x,
      y: shape.geometry.y
    };
  }
  if (geometryTool === "circle") {
    return {
      height: shape.geometry.r * 2,
      width: shape.geometry.r * 2,
      x: shape.geometry.cx - shape.geometry.r,
      y: shape.geometry.cy - shape.geometry.r
    };
  }
  if (geometryTool === "ellipse") {
    return {
      height: shape.geometry.ry * 2,
      width: shape.geometry.rx * 2,
      x: shape.geometry.cx - shape.geometry.rx,
      y: shape.geometry.cy - shape.geometry.ry
    };
  }
  if (geometryTool === "line") {
    const x = Math.min(shape.geometry.point1.x, shape.geometry.point2.x);
    const y = Math.min(shape.geometry.point1.y, shape.geometry.point2.y);
    return {
      height: Math.max(1, Math.abs(shape.geometry.point2.y - shape.geometry.point1.y)),
      width: Math.max(1, Math.abs(shape.geometry.point2.x - shape.geometry.point1.x)),
      x,
      y
    };
  }
  if (geometryTool === "polygon" || geometryTool === "polyline") {
    const xValues = shape.geometry.points.map((point) => point.x);
    const yValues = shape.geometry.points.map((point) => point.y);
    const minX = Math.min(...xValues);
    const minY = Math.min(...yValues);
    return {
      height: Math.max(1, Math.max(...yValues) - minY),
      width: Math.max(1, Math.max(...xValues) - minX),
      x: minX,
      y: minY
    };
  }
  if (geometryTool === "arc") {
    return {
      height: shape.geometry.r * 2,
      width: shape.geometry.r * 2,
      x: shape.geometry.cx - shape.geometry.r,
      y: shape.geometry.cy - shape.geometry.r
    };
  }
  if (geometryTool === "text") {
    return {
      height: shape.geometry.fontSize,
      width: Math.max(24, shape.geometry.text.length * shape.geometry.fontSize * 0.6),
      x: shape.geometry.x,
      y: shape.geometry.y - shape.geometry.fontSize
    };
  }
  throw new Error(`unsupported shape bounds for ${shapeTool(shape)}`);
}

function objectBounds(object, frame) {
  const visibleShapes = sortedShapes(object)
    .map((shape, shapeIndex) => effectiveShapeForFrame(shape, frame, shapeIndex))
    .filter((shape) => shape.visible);
  if (!visibleShapes.length) {
    return { height: 80, width: 120, x: -60, y: -40 };
  }
  const transformOrigin = objectTransformOrigin(object);
  return combineObjectVectorBounds(visibleShapes.map((shape) => transformedObjectVectorShapeBounds(
    objectVectorBoundsCornerPoints(shapeBounds(shape)),
    shapeTransform(shape),
    transformOrigin
  )));
}

function effectiveShapeForFrame(shape, frame, shapeIndex) {
  const effective = deepClone(shape);
  const override = frame?.shapeOverrides?.find((entry) => entry.shapeIndex === shapeIndex) || null;
  if (override && Object.prototype.hasOwnProperty.call(override, "visible")) {
    effective.visible = override.visible;
  }
  if (override?.transform) {
    effective.transform = { ...override.transform };
  }
  return effective;
}

export class ObjectVectorRuntimeAssetService {
  constructor({ fetchRef = (...args) => fetch(...args), logger = console, schemaUrl = DEFAULT_SCHEMA_URL } = {}) {
    this.assetCache = new Map();
    this.events = [];
    this.fetchRef = fetchRef;
    this.inheritedObjectCache = new Map();
    this.logger = logger;
    this.payloadCache = new Map();
    this.schema = null;
    this.schemaUrl = schemaUrl;
    this.reportedCacheKeys = new Set();
    this.lastFrameByObject = new Map();
  }

  get schemaPath() {
    return this.schemaUrl.pathname || String(this.schemaUrl);
  }

  async loadSchema() {
    if (this.schema) {
      return this.schema;
    }
    const response = await this.fetchRef(this.schemaUrl, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`${this.schemaPath} returned ${response.status}`);
    }
    const schema = await response.json();
    const schemaErrors = [];
    this.validateSchemaShape(schema, schemaErrors);
    if (schemaErrors.length) {
      throw new Error(schemaErrors.join(" "));
    }
    this.schema = schema;
    this.log("OK", `Object Vector runtime schema loaded from ${this.schemaPath}.`);
    return schema;
  }

  async loadFromManifest(manifestPath, { sourceLabel = manifestPath } = {}) {
    await this.loadSchema();
    try {
      const response = await this.fetchRef(manifestPath, { cache: "no-store" });
      if (!response.ok) {
        this.log("FAIL", `Object Vector runtime asset manifest load failed from ${sourceLabel}: ${response.status}.`);
        return null;
      }
      const manifest = await response.json();
      const payload = normalizeManifestPayload(manifest);
      if (!payload) {
        this.log("FAIL", `Object Vector runtime asset load failed from ${sourceLabel}: root.tools.${OBJECT_VECTOR_TOOL_ID} is missing.`);
        return null;
      }
      return this.loadPayload(payload, {
        sourceLabel: `${sourceLabel}:tools.${OBJECT_VECTOR_TOOL_ID}`
      });
    } catch (error) {
      this.log("FAIL", `Object Vector runtime asset manifest load failed from ${sourceLabel}: ${error.message}`);
      return null;
    }
  }

  async loadPayload(payload, { sourceLabel = "runtime payload" } = {}) {
    await this.loadSchema();
    const validation = this.validatePayload(payload);
    if (!validation.ok) {
      this.log("FAIL", `Object Vector runtime asset validation failed from ${sourceLabel}: ${validation.errors.join(" ")}`);
      return null;
    }

    const cacheKey = JSON.stringify({
      payload: validation.payload
    });
    if (this.payloadCache.has(cacheKey)) {
      this.log("OK", `Object Vector runtime cache hit for ${sourceLabel}: ${validation.payload.objects.length} objects.`);
      return this.payloadCache.get(cacheKey);
    }

    const assetSet = this.buildAssetSet(validation.payload, sourceLabel, {
      payloadCacheKey: cacheKey
    });
    this.payloadCache.set(cacheKey, assetSet);
    this.log("OK", `Object Vector runtime cache miss for ${sourceLabel}; cached ${assetSet.objectsById.size} objects.`);
    this.log("OK", `Object Vector runtime asset load from ${sourceLabel}: ${assetSet.objectsById.size} objects.`);
    return assetSet;
  }

  buildAssetSet(payload, sourceLabel, options = {}) {
    const dependencyGraph = new Map();
    const objectsById = new Map();
    const objectsByName = new Map();
    const objectOrderById = new Map();
    const objectsByTag = new Map();
    payload.objects.forEach((object, index) => {
      objectsById.set(object.id, object);
      objectsByName.set(object.name.toLowerCase(), object);
      objectOrderById.set(object.id, index);
      normalizeTags(object.tags).forEach((tag) => {
        if (!objectsByTag.has(tag)) {
          objectsByTag.set(tag, []);
        }
        objectsByTag.get(tag).push(object);
      });
      dependencyGraph.set(object.id, object.baseObjectId ? [object.baseObjectId] : []);
    });
    return {
      dependencyGraph,
      objectOrderById,
      objectsById,
      objectsByName,
      objectsByTag,
      payload,
      payloadCacheKey: normalizeString(options.payloadCacheKey),
      sourceLabel
    };
  }

  resolveObject(assetSet, {
    assetId = "",
    objectId = "",
    name = "",
    requireManifestBinding = false,
    runtimeRole = "",
    tags = []
  } = {}) {
    if (!assetSet) {
      this.log("FAIL", "Object Vector runtime object resolution failed: no validated asset set is loaded.");
      return null;
    }
    const normalizedTags = normalizeTags(tags);
    const explicitObjectId = objectId || assetId;
    const resolutionKey = normalizedTags.length
      ? `role:${runtimeRole || "tagged"}:${normalizedTags.join("+")}:${explicitObjectId || "none"}:${requireManifestBinding ? "manifest-required" : "tag-selected"}`
      : `id:${assetId || objectId || name || "unknown"}`;
    const cacheNamespace = assetSet.payloadCacheKey || assetSet.sourceLabel;
    const cacheKey = `${cacheNamespace}:${resolutionKey}`;
    if (this.assetCache.has(cacheKey)) {
      this.logCacheOnce(cacheKey, `Object Vector runtime cache hit for ${runtimeRole || assetId || objectId || name}.`);
      return this.assetCache.get(cacheKey);
    }

    let object = normalizedTags.length
      ? this.resolveObjectByTags(assetSet, normalizedTags, { explicitObjectId, requireManifestBinding, runtimeRole })
      : null;
    let resolvedObjectId = object ? object.id : explicitObjectId;
    if (!object && !(normalizedTags.length && requireManifestBinding)) {
      object = resolvedObjectId ? assetSet.objectsById.get(resolvedObjectId) : null;
      if (!object && name) {
        object = assetSet.objectsByName.get(name.toLowerCase()) || null;
      }
    }
    if (!object) {
      this.log("FAIL", `Object Vector runtime object resolution failed: role=${runtimeRole || "none"} tags=${normalizedTags.join(",") || "none"} objectId=${objectId || "none"} name=${name || "none"} manifestBinding=${requireManifestBinding ? "required" : "optional"}.`);
      return null;
    }

    const resolvedObject = this.resolveInheritedObject(assetSet, object);
    if (!resolvedObject) {
      return null;
    }
    this.assetCache.set(cacheKey, resolvedObject);
    this.logCacheOnce(
      cacheKey,
      `Object Vector runtime cache miss for ${runtimeRole || assetId || object.id}; cached resolved object${runtimeRole ? ` ${object.id}` : ""}.`
    );
    return resolvedObject;
  }

  resolveObjectByTags(assetSet, tags, {
    explicitObjectId = "",
    requireManifestBinding = false,
    runtimeRole = ""
  } = {}) {
    const objects = Array.isArray(assetSet?.payload?.objects) ? assetSet.payload.objects : [];
    const explicitObject = explicitObjectId ? assetSet.objectsById.get(explicitObjectId) || null : null;
    const candidates = objects
      .map((object, index) => ({
        index,
        object,
        oldSignal: objectHasOldSignal(object)
      }))
      .filter((candidate) => candidate.object && objectHasTags(candidate.object, tags));

    if (requireManifestBinding) {
      if (!explicitObjectId) {
        this.log(
          "FAIL",
          `Object Vector runtime role ${runtimeRole || "tagged"} requires an explicit manifest object binding for tags [${tags.join(", ")}].`,
          {
            candidates: candidates.map(taggedCandidateLabel),
            objectCount: objects.length,
            tags
          }
        );
        return null;
      }
      if (!explicitObject) {
        this.log(
          "FAIL",
          `Object Vector runtime role ${runtimeRole || "tagged"} manifest binding ${explicitObjectId} does not match any loaded Object Vector object.`,
          {
            candidates: candidates.map(taggedCandidateLabel),
            explicitObjectId,
            objectCount: objects.length,
            tags
          }
        );
        return null;
      }
      if (objectHasOldSignal(explicitObject)) {
        this.log(
          "FAIL",
          `Object Vector runtime role ${runtimeRole || "tagged"} manifest binding ${explicitObjectId} points to an old/legacy object; update the manifest binding to the active object.`,
          {
            candidates: candidates.map(taggedCandidateLabel),
            explicitObjectId,
            objectTags: normalizeTags(explicitObject.tags),
            tags
          }
        );
        return null;
      }
      if (!objectHasTags(explicitObject, tags)) {
        this.log(
          "FAIL",
          `Object Vector runtime role ${runtimeRole || "tagged"} manifest binding ${explicitObjectId} is missing required tags [${tags.join(", ")}].`,
          {
            candidates: candidates.map(taggedCandidateLabel),
            explicitObjectId,
            objectTags: normalizeTags(explicitObject.tags),
            tags
          }
        );
        return null;
      }
      if (!candidates.some((candidate) => candidate.object.id === explicitObjectId)) {
        this.log(
          "FAIL",
          `Object Vector runtime role ${runtimeRole || "tagged"} manifest binding ${explicitObjectId} was not found in tag candidates [${tags.join(", ")}].`,
          {
            candidates: candidates.map(taggedCandidateLabel),
            explicitObjectId,
            tags
          }
        );
        return null;
      }
      if (candidates.length > 1) {
        this.log(
          "WARN",
          `Object Vector runtime role ${runtimeRole || "tagged"} matched multiple objects by tags [${tags.join(", ")}]; using explicit manifest binding ${explicitObjectId}.`,
          {
            candidates: candidates.map(taggedCandidateLabel),
            selectedObjectId: explicitObjectId
          }
        );
      }
      return explicitObject;
    }

    if (candidates.length) {
      const selected = selectTaggedCandidate(candidates);
      if (candidates.length > 1) {
        this.log(
          "WARN",
          `Object Vector runtime role ${runtimeRole || "tagged"} matched multiple objects by tags [${tags.join(", ")}]; selected ${selected.object.id}.`,
          {
            candidates: candidates.map(taggedCandidateLabel),
            selectedObjectId: selected.object.id
          }
        );
      }
      if (explicitObjectId && explicitObjectId !== selected.object.id) {
        this.log(
          "WARN",
          `Object Vector runtime role ${runtimeRole || "tagged"} ignored explicit objectId ${explicitObjectId}; manifest tags selected ${selected.object.id}.`,
          {
            explicitObjectHasRoleTags: Boolean(explicitObject && objectHasTags(explicitObject, tags)),
            explicitObjectId,
            selectedObjectId: selected.object.id,
            tags
          }
        );
      }
      return selected.object;
    }

    if (explicitObject) {
      this.log(
        "WARN",
        `Object Vector runtime role ${runtimeRole || "tagged"} found no object tagged [${tags.join(", ")}]; using explicit objectId ${explicitObject.id}.`,
        {
          explicitObjectId: explicitObject.id,
          tags
        }
      );
      return explicitObject;
    }

    this.log(
      "FAIL",
      `Object Vector runtime role ${runtimeRole || "tagged"} could not resolve an object tagged [${tags.join(", ")}].`,
      {
        explicitObjectId,
        objectCount: objects.length,
        tags
      }
    );
    return null;
  }

  resolveInheritedObject(assetSet, object) {
    if (!object?.baseObjectId) {
      return object;
    }
    const cacheKey = `${assetSet.payloadCacheKey || assetSet.sourceLabel}:inherit:${object.id}`;
    if (this.inheritedObjectCache.has(cacheKey)) {
      this.logCacheOnce(`${cacheKey}:hit`, `Object Vector runtime inherited cache hit for ${object.id}.`);
      return this.inheritedObjectCache.get(cacheKey);
    }
    const resolved = this.mergeInheritedObject(assetSet, object, []);
    if (!resolved) {
      return null;
    }
    this.inheritedObjectCache.set(cacheKey, resolved);
    this.log("OK", `Object Vector runtime inheritance resolved for ${object.id} from ${object.baseObjectId}; cached inherited render payload.`);
    return resolved;
  }

  mergeInheritedObject(assetSet, object, chain) {
    if (chain.includes(object.id)) {
      this.log("FAIL", `Object Vector runtime inheritance resolution failed for ${object.id}: circular inheritance chain ${[...chain, object.id].join(" -> ")}.`);
      return null;
    }
    if (!object.baseObjectId) {
      return deepClone(object);
    }
    const baseObject = assetSet.objectsById.get(object.baseObjectId);
    if (!baseObject) {
      this.log("FAIL", `Object Vector runtime inheritance resolution failed for ${object.id}: missing base object ${object.baseObjectId}.`);
      return null;
    }
    const resolvedBase = this.mergeInheritedObject(assetSet, baseObject, [...chain, object.id]);
    if (!resolvedBase) {
      return null;
    }
    const shapeByOrder = new Map(resolvedBase.shapes.map((shape) => [shape.order, deepClone(shape)]));
    object.shapes.forEach((shape) => {
      shapeByOrder.set(shape.order, deepClone(shape));
    });
    const stateById = new Map((resolvedBase.states || []).map((state) => [state.id, deepClone(state)]));
    (object.states || []).forEach((state) => {
      stateById.set(state.id, deepClone(state));
    });
    const merged = {
      ...resolvedBase,
      ...deepClone(object),
      inheritedFrom: object.baseObjectId,
      shapes: Array.from(shapeByOrder.values()).sort((left, right) => left.order - right.order)
    };
    if (stateById.size) {
      merged.states = Array.from(stateById.values());
    } else {
      delete merged.states;
    }
    return merged;
  }

  resolveFrame(object, { elapsedMs = 0, frameId = "", fps = 12, stateId = "" } = {}) {
    if (!stateId) {
      return { frame: null, state: null };
    }
    const state = Array.isArray(object?.states)
      ? object.states.find((candidate) => candidate.id === stateId)
      : null;
    if (!state) {
      this.log("WARN", `Object Vector runtime state ${stateId} is not defined for ${object?.id || "unknown object"}; rendering base shapes.`);
      return { frame: null, state: null };
    }

    const frames = sortedFrames(state);
    if (!frames.length) {
      this.log("FAIL", `Object Vector runtime state ${stateId} has no frames for ${object.id}.`);
      return { frame: null, state };
    }
    const exactFrame = frameId ? frames.find((candidate) => candidate.id === frameId) : null;
    if (frameId && !exactFrame) {
      this.log("FAIL", `Object Vector runtime frame ${stateId}/${frameId} is not defined for ${object.id}.`);
      return { frame: null, state };
    }
    const frame = exactFrame || this.frameAtElapsedTime(frames, elapsedMs, fps);
    const lastFrameKey = `${object.id}:${state.id}`;
    if (this.lastFrameByObject.get(lastFrameKey) !== frame.id) {
      this.lastFrameByObject.set(lastFrameKey, frame.id);
      this.log("OK", `Object Vector runtime frame resolved: ${object.id} ${state.id}/${frame.id}.`);
    }
    return { frame, state };
  }

  frameAtElapsedTime(frames, elapsedMs, fps) {
    const safeFps = Number.isFinite(fps) && fps > 0 ? fps : 12;
    const safeElapsedMs = Number.isFinite(elapsedMs) ? Math.max(0, elapsedMs) : 0;
    const totalFrameUnits = frames.reduce((total, frame) => total + frame.durationFrames, 0);
    const elapsedFrameUnit = Math.floor((safeElapsedMs / 1000) * safeFps) % totalFrameUnits;
    let cursor = 0;
    return frames.find((frame) => {
      cursor += frame.durationFrames;
      return elapsedFrameUnit < cursor;
    }) || frames[0];
  }

  renderObject(renderer, assetSet, options = {}) {
    const object = this.resolveObject(assetSet, options);
    if (!object) {
      return { frameId: "", ok: false, renderedShapes: 0, stateId: "" };
    }
    const context = renderer?.ctx;
    if (!context) {
      this.log("FAIL", `Object Vector runtime render failed for ${object.id}: renderer.ctx is unavailable.`);
      return { frameId: "", ok: false, renderedShapes: 0, stateId: "" };
    }

    const { frame, state } = this.resolveFrame(object, options);
    const renderedShapes = this.drawObjectToCanvas(context, object, frame, options);
    if (renderedShapes < 0) {
      return { frameId: frame?.id || "", ok: false, renderedShapes: 0, stateId: state?.id || "" };
    }
    this.logCacheOnce(
      `render:${object.id}:${state?.id || "base"}:${frame?.id || "base"}`,
      `Object Vector runtime rendered ${object.id}: ${renderedShapes} shapes${state ? ` state=${state.id}` : ""}${frame ? ` frame=${frame.id}` : ""}.`
    );
    return { frameId: frame?.id || "", ok: true, renderedShapes, stateId: state?.id || "" };
  }

  drawObjectToCanvas(context, object, frame, options = {}) {
    try {
      const worldScreenTransform = createWorldScreenTransform({
        worldScale: options.worldScale
      });
      context.save();
      worldScreenTransform.applyObjectRenderTransform(context, options);
      let renderedShapes = 0;
      const transformOrigin = objectTransformOrigin(object);
      sortedShapes(object).forEach((shape, shapeIndex) => {
        const effective = effectiveShapeForFrame(shape, frame, shapeIndex);
        if (!effective.visible) {
          return;
        }
        this.drawShape(context, effective, transformOrigin);
        renderedShapes += 1;
      });
      context.restore();
      return renderedShapes;
    } catch (error) {
      context.restore();
      this.log("FAIL", `Object Vector runtime render failed for ${object.id}: ${error.message}`);
      return -1;
    }
  }

  drawShape(context, shape, transformOrigin = { x: 0, y: 0 }) {
    const transform = shapeTransform(shape);
    context.save();
    try {
      applyObjectVectorCanvasTransform(context, transform, transformOrigin);
      context.lineWidth = shape.style.strokeWidth;
      context.lineCap = pointStyleValue(shape.style.strokeLinecap ?? shape.style.startPointStyle ?? shape.style.pointStyle);
      context.lineJoin = strokeLineJoinValue(shape.style.pointStyle ?? shape.style.strokeLinecap);
      context.fillStyle = normalizeFill(shape.style.fill) || "transparent";
      context.strokeStyle = normalizeStroke(shape.style.stroke) || "transparent";
      this.buildPath(context, shape);
      const fillColor = normalizeFill(shape.style.fill);
      const strokeColor = normalizeStroke(shape.style.stroke);
      if (fillColor) {
        context.globalAlpha = shape.style.fillOpacity;
        context.fill();
      }
      if (strokeColor && shape.style.strokeWidth > 0) {
        context.globalAlpha = shape.style.strokeOpacity;
        context.stroke();
      }
    } finally {
      context.restore();
    }
  }

  buildPath(context, shape) {
    context.beginPath();
    const geometryTool = shapeGeometryTool(shape);
    if (geometryTool === "rectangle") {
      const roundedPath = roundedPointPathCommands(shape, { closed: true });
      if (roundedPath.length) {
        applyRuntimePathCommands(context, roundedPath);
        return;
      }
      context.rect(shape.geometry.x, shape.geometry.y, shape.geometry.width, shape.geometry.height);
      return;
    }
    if (geometryTool === "circle") {
      context.arc(shape.geometry.cx, shape.geometry.cy, shape.geometry.r, 0, Math.PI * 2);
      return;
    }
    if (geometryTool === "ellipse") {
      context.ellipse(shape.geometry.cx, shape.geometry.cy, shape.geometry.rx, shape.geometry.ry, 0, 0, Math.PI * 2);
      return;
    }
    if (geometryTool === "line") {
      context.moveTo(shape.geometry.point1.x, shape.geometry.point1.y);
      context.lineTo(shape.geometry.point2.x, shape.geometry.point2.y);
      return;
    }
    if (geometryTool === "polygon" || geometryTool === "polyline") {
      const roundedPath = roundedPointPathCommands(shape, { closed: geometryTool === "polygon" });
      if (roundedPath.length) {
        applyRuntimePathCommands(context, roundedPath);
        return;
      }
      shape.geometry.points.forEach((point, index) => {
        if (index === 0) {
          context.moveTo(point.x, point.y);
        } else {
          context.lineTo(point.x, point.y);
        }
      });
      if (geometryTool === "polygon") {
        context.closePath();
      }
      return;
    }
    if (geometryTool === "arc") {
      context.arc(
        shape.geometry.cx,
        shape.geometry.cy,
        shape.geometry.r,
        (shape.geometry.startAngle * Math.PI) / 180,
        (shape.geometry.endAngle * Math.PI) / 180
      );
      return;
    }
    if (geometryTool === "text") {
      context.font = `${shape.geometry.fontSize}px sans-serif`;
      context.fillText(shape.geometry.text, shape.geometry.x, shape.geometry.y);
      return;
    }
    throw new Error(`unsupported runtime shape tool ${shapeTool(shape)}`);
  }

  createSvgString(assetSet, options = {}) {
    const object = this.resolveObject(assetSet, options);
    if (!object) {
      return { ok: false, svg: "" };
    }
    const { frame, state } = this.resolveFrame(object, options);
    const visibleShapes = sortedShapes(object).map((shape, shapeIndex) => effectiveShapeForFrame(shape, frame, shapeIndex)).filter((shape) => shape.visible);
    if (!visibleShapes.length) {
      this.log("FAIL", `Object Vector runtime SVG preview failed for ${object.id}: no visible shapes.`);
      return { ok: false, svg: "" };
    }
    const bounds = objectBounds(object, frame);
    const padding = 12;
    const viewBox = `${bounds.x - padding} ${bounds.y - padding} ${bounds.width + padding * 2} ${bounds.height + padding * 2}`;
    const metadata = JSON.stringify({
      frameId: frame?.id || null,
      objectId: object.id,
      stateId: state?.id || null,
      toolId: OBJECT_VECTOR_TOOL_ID
    });
    const transformOrigin = objectTransformOrigin(object);
    const shapes = visibleShapes.map((shape) => this.shapeToSvg(shape, transformOrigin)).join("");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeXml(object.name)} Object Vector runtime preview" data-runtime-object-vector="true" viewBox="${viewBox}"><metadata>${escapeXml(metadata)}</metadata>${shapes}</svg>`;
    this.log("OK", `Object Vector runtime SVG preview generated for ${object.id}${state ? ` state=${state.id}` : ""}${frame ? ` frame=${frame.id}` : ""}.`);
    return { ok: true, svg };
  }

  shapeToSvg(shape, transformOrigin = { x: 0, y: 0 }) {
    const lineCap = pointStyleValue(shape.style.strokeLinecap ?? shape.style.startPointStyle ?? shape.style.pointStyle);
    const lineJoin = strokeLineJoinValue(shape.style.pointStyle ?? shape.style.strokeLinecap);
    const style = ` fill="${escapeXml(shape.style.fill)}" fill-opacity="${shape.style.fillOpacity}" stroke="${escapeXml(shape.style.stroke)}" stroke-opacity="${shape.style.strokeOpacity}" stroke-width="${shape.style.strokeWidth}" stroke-linecap="${lineCap}" stroke-linejoin="${lineJoin}" transform="${objectVectorSvgTransformAttribute(shapeTransform(shape), transformOrigin)}"`;
    const geometryTool = shapeGeometryTool(shape);
    if (geometryTool === "rectangle") {
      const roundedPath = roundedPointPathCommands(shape, { closed: true });
      if (roundedPath.length) {
        const d = runtimePathCommandsToSvgPath(roundedPath);
        const points = shapeGeometryPoints(shape).map((point) => `${point.x},${point.y}`).join(" ");
        return `<path d="${d}" points="${points}" data-runtime-rounded-point-render="path"${style}/>`;
      }
      return `<rect x="${shape.geometry.x}" y="${shape.geometry.y}" width="${shape.geometry.width}" height="${shape.geometry.height}"${style}/>`;
    }
    if (geometryTool === "circle") {
      return `<circle cx="${shape.geometry.cx}" cy="${shape.geometry.cy}" r="${shape.geometry.r}"${style}/>`;
    }
    if (geometryTool === "ellipse") {
      return `<ellipse cx="${shape.geometry.cx}" cy="${shape.geometry.cy}" rx="${shape.geometry.rx}" ry="${shape.geometry.ry}"${style}/>`;
    }
    if (geometryTool === "line") {
      return `<line x1="${shape.geometry.point1.x}" y1="${shape.geometry.point1.y}" x2="${shape.geometry.point2.x}" y2="${shape.geometry.point2.y}"${style}/>`;
    }
    if (geometryTool === "polygon" || geometryTool === "polyline") {
      const points = shape.geometry.points.map((point) => `${point.x},${point.y}`).join(" ");
      const roundedPath = roundedPointPathCommands(shape, { closed: geometryTool === "polygon" });
      if (roundedPath.length) {
        const d = runtimePathCommandsToSvgPath(roundedPath);
        return `<path d="${d}" points="${points}" data-runtime-rounded-point-render="path"${style}/>`;
      }
      return geometryTool === "polygon"
        ? `<polygon points="${points}"${style}/>`
        : `<polyline points="${points}"${style}/>`;
    }
    if (geometryTool === "arc") {
      const start = {
        x: shape.geometry.cx + Math.cos((shape.geometry.startAngle * Math.PI) / 180) * shape.geometry.r,
        y: shape.geometry.cy + Math.sin((shape.geometry.startAngle * Math.PI) / 180) * shape.geometry.r
      };
      const end = {
        x: shape.geometry.cx + Math.cos((shape.geometry.endAngle * Math.PI) / 180) * shape.geometry.r,
        y: shape.geometry.cy + Math.sin((shape.geometry.endAngle * Math.PI) / 180) * shape.geometry.r
      };
      return `<path d="M ${start.x} ${start.y} A ${shape.geometry.r} ${shape.geometry.r} 0 0 1 ${end.x} ${end.y}"${style}/>`;
    }
    if (geometryTool === "text") {
      return `<text x="${shape.geometry.x}" y="${shape.geometry.y}" font-size="${shape.geometry.fontSize}"${style}>${escapeXml(shape.geometry.text)}</text>`;
    }
    throw new Error(`unsupported runtime SVG shape tool ${shapeTool(shape)}`);
  }

  validateSchemaShape(schema, errors) {
    if (!isPlainObject(schema)) {
      errors.push("Object Vector Studio V2 schema root must be an object.");
      return;
    }
    if (schema.$id !== "object-vector-studio-v2.schema.json") {
      errors.push("Object Vector Studio V2 schema id must be object-vector-studio-v2.schema.json.");
    }
    if (schema.additionalProperties !== false) {
      errors.push("Object Vector Studio V2 schema root must reject unknown properties.");
    }
    if (schema.properties?.toolId?.const !== OBJECT_VECTOR_TOOL_ID) {
      errors.push(`Object Vector Studio V2 schema toolId must be ${OBJECT_VECTOR_TOOL_ID}.`);
    }
    if (!isPlainObject(schema.$defs?.shape) || !Array.isArray(schema.$defs.shape.oneOf)) {
      errors.push("Object Vector Studio V2 schema must define shape variants.");
    }
    if (Object.prototype.hasOwnProperty.call(schema.$defs?.object?.properties || {}, "type")) {
      errors.push("Object Vector Studio V2 object schema must not define object type.");
    }
    if (Object.prototype.hasOwnProperty.call(schema.properties || {}, "assetLibrary")) {
      errors.push("Object Vector Studio V2 schema must not define assetLibrary.");
    }
    ["id", "shapeKey", "label", "type"].forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(schema.$defs?.shapeCommon?.properties || {}, key)) {
        errors.push(`Object Vector Studio V2 shape schema must not define deprecated shape field ${key}.`);
      }
    });
    const requiredShapeFields = schema.$defs?.shapeCommon?.required || [];
    if (!requiredShapeFields.includes("tool")) {
      errors.push("Object Vector Studio V2 shape schema must require tool.");
    }
    const overrideFields = schema.$defs?.shapeFrameOverride?.required || [];
    if (!overrideFields.includes("shapeIndex")) {
      errors.push("Object Vector Studio V2 shape frame override schema must require shapeIndex.");
    }
  }

  validatePayload(payload) {
    if (!this.schema) {
      return {
        errors: ["Object Vector runtime schema is not loaded."],
        ok: false,
        payload: null
      };
    }
    const errors = [];
    this.validateValue(this.schema, payload, "root", errors);
    if (!errors.length) {
      this.validateInheritanceReferences(payload, errors);
    }
    if (!errors.length) {
      this.validateAnimationReferences(payload, errors);
    }
    if (errors.length) {
      return { errors, ok: false, payload: null };
    }
    return {
      errors: [],
      ok: true,
      payload: this.normalizePayload(payload)
    };
  }

  validateAnimationReferences(payload, errors) {
    const objectsById = new Map(payload.objects.map((object) => [object.id, object]));
    payload.objects.forEach((object, objectIndex) => {
      const shapeCount = this.collectInheritedShapeCount(object, objectsById, new Set(), errors, `root.objects[${objectIndex}]`);
      (object.states || []).forEach((state, stateIndex) => {
        state.frames.forEach((frame, frameIndex) => {
          frame.shapeOverrides.forEach((override, overrideIndex) => {
            if (override.shapeIndex >= shapeCount) {
              errors.push(`root.objects[${objectIndex}].states[${stateIndex}].frames[${frameIndex}].shapeOverrides[${overrideIndex}].shapeIndex ${override.shapeIndex} must reference a local or inherited sorted shape row.`);
            }
          });
        });
      });
    });
  }

  validateInheritanceReferences(payload, errors) {
    const objectsById = new Map();
    payload.objects.forEach((object, objectIndex) => {
      if (!isObjectIdentityId(object.id)) {
        errors.push(`root.objects[${objectIndex}].id ${object.id} must follow object.game.name.`);
      }
      if (objectsById.has(object.id)) {
        errors.push(`root.objects[${objectIndex}].id ${object.id} duplicates an existing object id.`);
        return;
      }
      objectsById.set(object.id, object);
    });
    payload.objects.forEach((object, objectIndex) => {
      const localShapeOrders = new Set();
      object.shapes.forEach((shape, shapeIndex) => {
        if (localShapeOrders.has(shape.order)) {
          errors.push(`root.objects[${objectIndex}].shapes[${shapeIndex}].order ${shape.order} duplicates a local shape order.`);
        }
        localShapeOrders.add(shape.order);
      });
      const seen = new Set([object.id]);
      let current = object;
      while (current?.baseObjectId) {
        const baseId = current.baseObjectId;
        if (seen.has(baseId)) {
          errors.push(`root.objects[${objectIndex}].baseObjectId creates a circular inheritance chain at ${baseId}.`);
          return;
        }
        const baseObject = objectsById.get(baseId);
        if (!baseObject) {
          errors.push(`root.objects[${objectIndex}].baseObjectId ${baseId} must reference an existing base object.`);
          return;
        }
        seen.add(baseId);
        current = baseObject;
      }
    });
  }

  collectInheritedShapeCount(object, objectsById, seen, errors, path) {
    return this.collectInheritedShapesByOrder(object, objectsById, seen, errors, path).size;
  }

  collectInheritedShapesByOrder(object, objectsById, seen, errors, path) {
    const shapeByOrder = new Map();
    if (!object || seen.has(object.id)) {
      if (object) {
        errors.push(`${path}.baseObjectId creates a circular shape inheritance chain at ${object.id}.`);
      }
      return shapeByOrder;
    }
    seen.add(object.id);
    if (object.baseObjectId) {
      const baseObject = objectsById.get(object.baseObjectId);
      if (baseObject) {
        this.collectInheritedShapesByOrder(baseObject, objectsById, seen, errors, path)
          .forEach((shape, order) => shapeByOrder.set(order, shape));
      }
    }
    object.shapes.forEach((shape) => shapeByOrder.set(shape.order, shape));
    return shapeByOrder;
  }

  validateValue(schemaNode, value, path, errors) {
    const schema = schemaNode?.$ref ? resolveSchemaRef(this.schema, schemaNode.$ref) : schemaNode;
    if (!schema) {
      errors.push(`${path} references an unavailable Object Vector Studio V2 schema definition.`);
      return;
    }
    if (Array.isArray(schema.allOf)) {
      schema.allOf.forEach((entry) => this.validateValue(entry, value, path, errors));
      return;
    }
    if (Array.isArray(schema.oneOf)) {
      const matchedCount = schema.oneOf.reduce((count, entry) => {
        const optionErrors = [];
        this.validateValue(entry, value, path, optionErrors);
        return optionErrors.length === 0 ? count + 1 : count;
      }, 0);
      if (matchedCount !== 1) {
        errors.push(`${path} must match exactly one Object Vector Studio V2 shape schema.`);
      }
      return;
    }
    this.validateConst(schema, value, path, errors);
    this.validateEnum(schema, value, path, errors);
    if (schema.type && !this.validateType(schema, value, path, errors)) {
      return;
    }
    this.validateString(schema, value, path, errors);
    this.validateNumber(schema, value, path, errors);
    this.validateArray(schema, value, path, errors);
    this.validateObject(schema, value, path, errors);
  }

  validateConst(schema, value, path, errors) {
    if (Object.prototype.hasOwnProperty.call(schema, "const") && value !== schema.const) {
      errors.push(`${path} must be ${schema.const}.`);
    }
  }

  validateEnum(schema, value, path, errors) {
    if (Array.isArray(schema.enum) && !schema.enum.includes(value)) {
      errors.push(`${path} must be one of ${schema.enum.join(", ")}.`);
    }
  }

  validateType(schema, value, path, errors) {
    const expectedTypes = Array.isArray(schema.type) ? schema.type : [schema.type];
    const matched = expectedTypes.some((expectedType) => typeMatches(expectedType, value));
    if (!matched) {
      errors.push(expectedTypes.length > 1
        ? `${path} must be one of ${expectedTypes.join(", ")}.`
        : `${path} must be ${typeDescription(schema.type)}.`);
    }
    return matched;
  }

  validateString(schema, value, path, errors) {
    if (typeof value === "string" && Number.isInteger(schema.minLength) && value.trim().length < schema.minLength) {
      errors.push(`${path} must contain at least ${schema.minLength} characters.`);
    }
  }

  validateNumber(schema, value, path, errors) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      return;
    }
    if (typeof schema.minimum === "number" && value < schema.minimum) {
      errors.push(`${path} must be at least ${schema.minimum}.`);
    }
    if (typeof schema.exclusiveMinimum === "number" && value <= schema.exclusiveMinimum) {
      errors.push(`${path} must be greater than ${schema.exclusiveMinimum}.`);
    }
    if (typeof schema.maximum === "number" && value > schema.maximum) {
      errors.push(`${path} must be at most ${schema.maximum}.`);
    }
  }

  validateArray(schema, value, path, errors) {
    if (!Array.isArray(value)) {
      return;
    }
    if (Number.isInteger(schema.minItems) && value.length < schema.minItems) {
      errors.push(`${path} must contain at least ${schema.minItems} items.`);
    }
    if (Number.isInteger(schema.maxItems) && value.length > schema.maxItems) {
      errors.push(`${path} must contain no more than ${schema.maxItems} items.`);
    }
    if (schema.items) {
      value.forEach((item, index) => this.validateValue(schema.items, item, `${path}[${index}]`, errors));
    }
  }

  validateObject(schema, value, path, errors) {
    if (!isPlainObject(value)) {
      return;
    }
    if (Array.isArray(schema.required)) {
      schema.required.forEach((key) => {
        if (!Object.prototype.hasOwnProperty.call(value, key)) {
          errors.push(`${path}.${key} is required.`);
        }
      });
    }
    const properties = isPlainObject(schema.properties) ? schema.properties : {};
    Object.entries(properties).forEach(([key, childSchema]) => {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        this.validateValue(childSchema, value[key], `${path}.${key}`, errors);
      }
    });
    if (schema.additionalProperties === false) {
      Object.keys(value).forEach((key) => {
        if (!Object.prototype.hasOwnProperty.call(properties, key)) {
          errors.push(`${path}.${key} is not allowed.`);
        }
      });
    }
  }

  normalizePayload(payload) {
    const normalized = deepClone(payload);
    normalized.name = normalized.name.trim();
    normalized.objects = normalized.objects.map((object) => {
      const normalizedObject = {
        ...object,
        baseObjectId: typeof object.baseObjectId === "string" ? object.baseObjectId.trim() : undefined,
        id: object.id.trim(),
        name: object.name.trim(),
        tags: Array.isArray(object.tags) ? object.tags.map((tag) => tag.trim()).filter(Boolean) : undefined,
        shapes: object.shapes.map((shape) => ({
          ...shape,
          tool: shape.tool.trim().toLowerCase()
        }))
      };
      if (Array.isArray(object.states)) {
        normalizedObject.states = object.states.map((state) => ({
          ...state,
          id: state.id.trim().toLowerCase(),
          name: state.name.trim(),
          frames: state.frames.map((frame) => ({
            ...frame,
            id: frame.id.trim(),
            shapeOverrides: frame.shapeOverrides.map((override) => ({
              ...override,
              shapeIndex: override.shapeIndex
            }))
          }))
        }));
      }
      if (normalizedObject.baseObjectId === undefined) {
        delete normalizedObject.baseObjectId;
      }
      if (normalizedObject.tags === undefined) {
        delete normalizedObject.tags;
      }
      return normalizedObject;
    });
    return normalized;
  }

  logCacheOnce(cacheKey, message) {
    if (this.reportedCacheKeys.has(cacheKey)) {
      return;
    }
    this.reportedCacheKeys.add(cacheKey);
    this.log("OK", message, { cacheKey });
  }

  log(level, message, details = {}) {
    const entry = {
      details: { ...details },
      level,
      message,
      timestamp: new Date().toISOString()
    };
    this.events.push(entry);
    if (this.events.length > 120) {
      this.events.splice(0, this.events.length - 120);
    }
    const line = `${level} ${message}`;
    if (typeof this.logger?.write === "function") {
      this.logger.write(line);
    } else if (level === "FAIL" && typeof this.logger?.error === "function") {
      this.logger.error(line, details);
    } else if (level === "WARN" && typeof this.logger?.warn === "function") {
      this.logger.warn(line, details);
    } else if (typeof this.logger?.info === "function") {
      this.logger.info(line, details);
    }
  }

  getDiagnostics() {
    return {
      cachedObjects: this.assetCache.size,
      cachedInheritedObjects: this.inheritedObjectCache.size,
      cachedPayloads: this.payloadCache.size,
      events: this.events.slice(-40),
      schemaLoaded: Boolean(this.schema)
    };
  }
}

export default ObjectVectorRuntimeAssetService;

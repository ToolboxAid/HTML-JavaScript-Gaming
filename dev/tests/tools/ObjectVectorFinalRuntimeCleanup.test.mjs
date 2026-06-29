import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getToolById } from "../../../www/toolbox/toolRegistry.js";

const REPO_ROOT = fileURLToPath(new URL("../../..", import.meta.url));
const ACTIVE_OBJECT_VECTOR_PATHS = Object.freeze([
  "games/Asteroids/game",
  "games/Asteroids/entities",
  "games/Asteroids/systems",
  "games/Asteroids/flow",
  "toolbox/workspace-manager-v2/js",
  "toolbox/object-vector-studio-v2/js",
  "www/src/engine/rendering/ObjectVectorRuntimeAssetService.js"
]);
const DEPRECATED_VECTOR_MAPS_GUARD = "toolbox/object-vector-studio-v2/js/services/ObjectVectorStudioV2SchemaService.js";

function readRepoFile(repoPath) {
  return readFileSync(path.join(REPO_ROOT, repoPath), "utf8");
}

function listSourceFiles(repoPath) {
  const absolutePath = path.join(REPO_ROOT, repoPath);
  if (repoPath.endsWith(".js") || repoPath.endsWith(".mjs")) {
    return [repoPath];
  }
  return readdirSync(absolutePath, { withFileTypes: true }).flatMap((entry) => {
    const childRepoPath = `${repoPath}/${entry.name}`;
    if (entry.isDirectory()) {
      return listSourceFiles(childRepoPath);
    }
    return entry.isFile() && (entry.name.endsWith(".js") || entry.name.endsWith(".mjs"))
      ? [childRepoPath]
      : [];
  });
}

function asteroidsObjectVectorPayload() {
  return JSON.parse(readRepoFile("games/Asteroids/game.manifest.json")).tools["object-vector-studio-v2"];
}

function objectById(payload, objectId) {
  return payload.objects.find((object) => object.id === objectId);
}

function maxRadius(points) {
  return Math.max(...points.map((point) => Math.hypot(point.x, point.y)));
}

export async function run() {
  const activeSourceFiles = ACTIVE_OBJECT_VECTOR_PATHS.flatMap(listSourceFiles);
  const disallowedTerms = [
    "objectVectorRoles",
    "vector-map-editor",
    "fallback vector map",
    "default vector map",
    "defaultVectorMap"
  ];
  activeSourceFiles.forEach((repoPath) => {
    const text = readRepoFile(repoPath);
    disallowedTerms.forEach((term) => {
      assert.equal(text.includes(term), false, `${repoPath} must not depend on ${term}.`);
    });
    if (repoPath !== DEPRECATED_VECTOR_MAPS_GUARD) {
      assert.equal(text.includes("vectorMaps"), false, `${repoPath} must not depend on legacy vectorMaps payload data.`);
    }
  });

  const schemaServiceText = readRepoFile(DEPRECATED_VECTOR_MAPS_GUARD);
  assert.match(schemaServiceText, /root\.vectorMaps is deprecated legacy vector-map data/);
  assert.match(schemaServiceText, /objects\[\]\.tags and root\.objects\[\]\.shapes only/);

  assert.equal(getToolById("vector-map-editor"), null, "Legacy world vector tool id must be absent from the active registry.");
  assert.ok(getToolById("world-vector-studio-v2"), "World Vector Studio V2 must be present in the active registry.");

  const objectVectorPayload = asteroidsObjectVectorPayload();
  assert.deepEqual(Object.keys(objectVectorPayload).sort(), ["name", "objects", "toolId", "version"]);
  assert.equal(Object.hasOwn(objectVectorPayload, "vectorMaps"), false);

  const ship = objectById(objectVectorPayload, "object.asteroids.ship");
  const flameLines = ship.shapes.filter((shape) => shape.tool === "line" && shape.style?.stroke === "#FFBE64");
  assert.equal(flameLines.length, 4, "Asteroids ship flame duplicate line shapes are intentional flicker animation assets.");
  const moveState = ship.states.find((state) => state.id === "move");
  assert.equal(moveState.frames.length >= 2, true, "Asteroids ship move state must preserve flicker animation frames.");

  const largeAsteroid = objectById(objectVectorPayload, "object.asteroids.large-asteroid");
  const mediumAsteroid = objectById(objectVectorPayload, "object.asteroids.medium-asteroid");
  const smallAsteroid = objectById(objectVectorPayload, "object.asteroids.small-asteroid");
  const largeRadius = maxRadius(largeAsteroid.shapes[0].geometry.points);
  const mediumRadius = maxRadius(mediumAsteroid.shapes[0].geometry.points);
  const smallRadius = maxRadius(smallAsteroid.shapes[0].geometry.points);
  assert.equal(largeRadius > mediumRadius && mediumRadius > smallRadius, true, "Asteroids object geometry must preserve arcade-scale large > medium > small proportions.");
}

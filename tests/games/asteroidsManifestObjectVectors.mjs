import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createAsteroidGeometryProfilesFromObjectVectorPayload } from '../../games/Asteroids/game/asteroidObjectGeometry.js';
import { loadAsteroidsVectorMapsFromManifest } from '../../games/Asteroids/game/asteroidsVectorMaps.js';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const manifestPath = path.join(repoRoot, 'games', 'Asteroids', 'game.manifest.json');

export function loadAsteroidsManifest() {
  return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
}

export function loadAsteroidsObjectVectorPayload() {
  return loadAsteroidsManifest().tools['object-vector-studio-v2'];
}

export function loadAsteroidsVectorMaps() {
  const result = loadAsteroidsVectorMapsFromManifest(loadAsteroidsManifest());
  if (!result.ok) {
    throw new Error(result.errors.join(' '));
  }
  return result.vectorMaps;
}

export function createAsteroidsTestGeometryProfiles() {
  return createAsteroidGeometryProfilesFromObjectVectorPayload(loadAsteroidsObjectVectorPayload(), {
    roleBindings: loadAsteroidsVectorMaps().objectVectorRoles,
  });
}

export function createAsteroidsTestSceneOptions(options = {}) {
  return {
    asteroidGeometryProfiles: createAsteroidsTestGeometryProfiles(),
    vectorMaps: loadAsteroidsVectorMaps(),
    ...options,
  };
}

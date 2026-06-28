import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createAsteroidGeometryProfilesFromObjectVectorPayload } from '../../../games/Asteroids/game/asteroidObjectGeometry.js';
import { loadAsteroidsObjectGeometryFromManifest } from '../../../games/Asteroids/game/asteroidsObjectGeometryManifest.js';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const manifestPath = path.join(repoRoot, 'www', 'games', 'Asteroids', 'game.manifest.json');

export function loadAsteroidsManifest() {
  return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
}

export function loadAsteroidsObjectVectorPayload() {
  return loadAsteroidsManifest().tools['object-vector-studio-v2'];
}

export function loadAsteroidsObjectGeometry() {
  const result = loadAsteroidsObjectGeometryFromManifest(loadAsteroidsManifest());
  if (!result.ok) {
    throw new Error(result.errors.join(' '));
  }
  return result.objectGeometry;
}

export function loadAsteroidsScreenDimensions() {
  const manifest = loadAsteroidsManifest();
  return {
    width: manifest.screen.width,
    height: manifest.screen.height,
  };
}

export function createAsteroidsTestGeometryProfiles() {
  return createAsteroidGeometryProfilesFromObjectVectorPayload(loadAsteroidsObjectVectorPayload());
}

export function createAsteroidsTestSceneOptions(options = {}) {
  return {
    asteroidGeometryProfiles: createAsteroidsTestGeometryProfiles(),
    objectGeometry: loadAsteroidsObjectGeometry(),
    screenDimensions: loadAsteroidsScreenDimensions(),
    ...options,
  };
}

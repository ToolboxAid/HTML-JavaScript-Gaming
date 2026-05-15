import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createAsteroidGeometryProfilesFromObjectVectorPayload } from '../../games/Asteroids/game/asteroidObjectGeometry.js';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const manifestPath = path.join(repoRoot, 'games', 'Asteroids', 'game.manifest.json');

export function loadAsteroidsManifest() {
  return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
}

export function loadAsteroidsObjectVectorPayload() {
  return loadAsteroidsManifest().game.workspace.tools['object-vector-studio-v2'];
}

export function createAsteroidsTestGeometryProfiles() {
  const manifest = loadAsteroidsManifest();
  return createAsteroidGeometryProfilesFromObjectVectorPayload(loadAsteroidsObjectVectorPayload(), {
    runtimeBindings: manifest.game.gameData.objectVectorRuntime.objectIds
  });
}

/*
Toolbox Aid
David Quesenberry
03/24/2026
main.js
*/
import Engine from '/src/engine/core/Engine.js';
import { InputService } from '/src/engine/input/index.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';
import SolarSystemScene from './game/SolarSystemScene.js';
import { loadGameSkin } from '/games/shared/gameSkinLoader.js';

const theme = new Theme(ThemeTokens);
const SOLAR_DEFAULT_SKIN_PATH = '/games/SolarSystem/assets/skins/default.json';
const SOLAR_FALLBACK_SKIN = Object.freeze({
  documentKind: 'game-skin',
  schema: 'games.solar-system.skin/1',
  version: 1,
  gameId: 'SolarSystem',
  name: 'Solar System Classic Skin',
  colors: {
    background: '#030712',
    frame: '#dbeafe',
    orbit: '#334155',
    text: '#dbeafe',
    muted: '#94a3b8',
    panel: '#07101d'
  },
  entities: {
    sun: { color: '#fbbf24', radius: 30 },
    planets: {
      mercury: { color: '#9ca3af' },
      venus: { color: '#fde68a' },
      earth: { color: '#38bdf8' },
      mars: { color: '#fb7185' },
      jupiter: { color: '#f59e0b' },
      saturn: { color: '#eab308' },
      uranus: { color: '#67e8f9' },
      neptune: { color: '#60a5fa' }
    },
    moons: {
      moon: { color: '#e5e7eb' },
      io: { color: '#fde68a' },
      europa: { color: '#dbeafe' },
      ganymede: { color: '#cbd5e1' },
      titan: { color: '#fef3c7' }
    },
    rings: {
      jupiter: 'rgba(245, 158, 11, 0.22)',
      saturn: 'rgba(253, 230, 138, 0.55)',
      uranus: 'rgba(103, 232, 249, 0.28)',
      neptune: 'rgba(96, 165, 250, 0.24)'
    }
  }
});

export function bootSolarSystem({
  documentRef = globalThis.document ?? null,
  EngineClass = Engine,
  InputServiceClass = InputService,
  SceneClass = SolarSystemScene,
} = {}) {
  if (!documentRef) {
    return null;
  }

  if (documentRef === globalThis.document && documentRef.documentElement && documentRef.body) {
    theme.applyDocumentTheme();
  }

  const canvas = documentRef.getElementById?.('game') ?? null;
  if (!canvas) {
    return null;
  }

  const input = new InputServiceClass();
  const engine = new EngineClass({
    canvas,
    width: 960,
    height: 720,
    fixedStepMs: 1000 / 60,
    input,
  });

  const scene = new SceneClass({ skin: SOLAR_FALLBACK_SKIN });
  void loadGameSkin({
    gameId: 'SolarSystem',
    defaultSkinPath: SOLAR_DEFAULT_SKIN_PATH,
    fallbackSkin: SOLAR_FALLBACK_SKIN,
    fallbackSchema: 'games.solar-system.skin/1'
  }).then(({ skin }) => {
    scene.applySkin?.(skin);
  });
  engine.setScene(scene);
  engine.start();

  canvas.addEventListener?.('click', async () => {
    const fullscreenState = engine.fullscreen?.getState?.();
    if (!fullscreenState?.available || fullscreenState.active) {
      return;
    }

    await engine.fullscreen.request();
  });

  return engine;
}

if (typeof document !== 'undefined') {
  bootSolarSystem();
}

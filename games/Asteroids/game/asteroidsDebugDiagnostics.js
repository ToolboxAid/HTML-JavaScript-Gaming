export const ASTEROIDS_DEBUG_WORLD_STAGES = Object.freeze(['parallax', 'entities', 'sprite-effects', 'vector-overlay']);

export function formatAsteroidsDebugEventSummary(details = {}) {
  if (!details || typeof details !== 'object') {
    return '';
  }

  const summaryParts = Object.entries(details)
    .map(([key, value]) => `${key}=${String(value)}`)
    .slice(0, 4);
  return summaryParts.join(' ');
}

export function buildAsteroidsDebugDiagnosticsContext({
  debugConfig,
  debugEvents,
  dtSeconds,
  engine,
  frameEvents,
  isPaused,
  session,
  world,
}) {
  const safeDt = Number.isFinite(dtSeconds) && dtSeconds > 0 ? dtSeconds : 1 / 60;
  const fps = safeDt > 0 ? Math.round(1 / safeDt) : 0;
  const activePlayer = session.activePlayer || { id: 1, score: 0, lives: 0 };
  const recentEvents = debugEvents.slice(-12);
  const input = engine?.input;

  return {
    runtime: {
      sceneId: 'asteroids-showcase',
      status: session.mode,
      fps,
      frameTimeMs: Math.round(safeDt * 1000 * 100) / 100,
      debugMode: debugConfig.debugMode,
      debugEnabled: debugConfig.debugEnabled === true,
    },
    camera: {
      x: 0,
      y: 0,
      viewportWidth: world.bounds.width,
      viewportHeight: world.bounds.height,
    },
    entities: {
      count: (world.shipActive ? 1 : 0) + world.asteroids.length + world.bullets.length + world.ufoBullets.length + (world.ufo ? 1 : 0),
      shipActive: world.shipActive,
      asteroidCount: world.asteroids.length,
      bulletCount: world.bullets.length,
      ufoBulletCount: world.ufoBullets.length,
    },
    tilemap: {
      width: 0,
      height: 0,
      tileSize: 0,
    },
    input: {
      left: input?.isDown?.('ArrowLeft') === true,
      right: input?.isDown?.('ArrowRight') === true,
      thrust: input?.isDown?.('ArrowUp') === true,
      fire: input?.isDown?.('Space') === true,
      pause: input?.isDown?.('KeyP') === true,
      consoleToggle: input?.isDown?.('ShiftLeft') === true && input?.isDown?.('Backquote') === true,
      overlayToggle: (input?.isDown?.('ControlLeft') === true || input?.isDown?.('ControlRight') === true) && input?.isDown?.('ShiftLeft') === true && input?.isDown?.('Backquote') === true,
    },
    hotReload: {
      enabled: false,
      pending: false,
      mode: 'showcase-manual',
    },
    validation: {
      errorCount: 0,
      warningCount: 0,
      asteroidsRecentEvents: recentEvents,
      asteroidsFrameEvents: frameEvents,
    },
    render: {
      stages: [...ASTEROIDS_DEBUG_WORLD_STAGES],
      debugSurfaceTail: ['debug-overlay', 'dev-console-surface'],
    },
    assets: {
      asteroidsShowcase: {
        session: {
          mode: session.mode,
          status: session.status,
          activePlayer: activePlayer.id,
          score: activePlayer.score,
          highScore: session.highScore,
          lives: activePlayer.lives,
          wave: world.wave,
          isPaused,
        },
        entities: {
          ship: {
            active: world.shipActive,
            x: world.ship.x,
            y: world.ship.y,
            vx: world.ship.vx,
            vy: world.ship.vy,
            angle: world.ship.angle,
          },
          asteroidCount: world.asteroids.length,
          bulletCount: world.bullets.length,
          ufoBulletCount: world.ufoBullets.length,
          ufo: {
            active: Boolean(world.ufo),
            type: world.ufo?.type || '',
          },
        },
        presets: {
          defaultCommand: 'asteroidsshowcase.preset.default',
          eventsCommand: 'asteroidsshowcase.preset.events',
        },
      },
    },
  };
}

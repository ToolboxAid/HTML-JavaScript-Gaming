/*
Toolbox Aid
David Quesenberry
03/23/2026
lateSampleBootstrap.js
*/
import Engine from '../../src/engine/core/Engine.js';
import { Theme, ThemeTokens } from '../../src/engine/theme/index.js';

const DEFAULT_WIDTH = 960;
const DEFAULT_HEIGHT = 540;

export function bootLateSample({
  SceneClass = null,
  sceneFactory = null,
  controls = [],
  canvasId = 'game',
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
  engineOptions = {},
} = {}) {
  const theme = new Theme(ThemeTokens);
  theme.applyDocumentTheme();

  const canvas = document.getElementById(canvasId);
  if (!canvas) {
    throw new Error(`Late sample bootstrap requires a canvas with id "${canvasId}".`);
  }

  const engine = new Engine({
    canvas,
    width,
    height,
    ...engineOptions,
  });

  const scene = typeof sceneFactory === 'function'
    ? sceneFactory({ engine, canvas })
    : SceneClass
      ? new SceneClass()
      : null;

  if (!scene) {
    throw new Error('Late sample bootstrap requires a SceneClass or sceneFactory.');
  }

  engine.setScene(scene);
  engine.start();

  controls.forEach(({ id, eventName = 'click', action }) => {
    document.getElementById(id)?.addEventListener(eventName, (event) => {
      action?.({ event, scene, engine, canvas });
    });
  });

  return { scene, engine, canvas };
}

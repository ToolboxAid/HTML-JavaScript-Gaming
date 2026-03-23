/* Toolbox Aid David Quesenberry 03/22/2026 main.js */
import { bootLateSample } from '../_shared/lateSampleBootstrap.js';
import TileMapEditorScene from './TileMapEditorScene.js';

bootLateSample({
  SceneClass: TileMapEditorScene,
  controls: [
    { id: 'tile-grass', action: ({ scene }) => scene.setTile(1) },
    { id: 'tile-water', action: ({ scene }) => scene.setTile(2) },
    { id: 'tile-paint', action: ({ scene }) => scene.paint() },
  ],
});

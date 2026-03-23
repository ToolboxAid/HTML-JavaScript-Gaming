/* Toolbox Aid David Quesenberry 03/22/2026 main.js */
import { bootLateSample } from '../_shared/lateSampleBootstrap.js';
import EntityPlacementEditorScene from './EntityPlacementEditorScene.js';

bootLateSample({
  SceneClass: EntityPlacementEditorScene,
  controls: [
    { id: 'entity-add', action: ({ scene }) => scene.add() },
    { id: 'entity-move', action: ({ scene }) => scene.move() },
  ],
});

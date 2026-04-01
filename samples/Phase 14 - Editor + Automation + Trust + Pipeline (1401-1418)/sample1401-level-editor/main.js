/*
Toolbox Aid
David Quesenberry
03/22/2026
main.js
*/
import { bootLateSample } from '../../_shared/lateSampleBootstrap.js';
import LevelEditorScene from './LevelEditorScene.js';

bootLateSample({
  SceneClass: LevelEditorScene,
  controls: [
    { id: 'level-paint', action: ({ scene }) => scene.paint() },
  ],
});

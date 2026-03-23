/* Toolbox Aid David Quesenberry 03/22/2026 main.js */
import { bootLateSample } from '../_shared/lateSampleBootstrap.js';
import TimelineCutsceneEditorScene from './TimelineCutsceneEditorScene.js';

bootLateSample({
  SceneClass: TimelineCutsceneEditorScene,
  controls: [
    { id: 'timeline-add', action: ({ scene }) => scene.add() },
    { id: 'timeline-move', action: ({ scene }) => scene.move() },
  ],
});

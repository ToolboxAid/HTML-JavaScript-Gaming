/*
Toolbox Aid
David Quesenberry
03/22/2026
main.js
*/
import { bootLateSample } from '../../_shared/lateSampleBootstrap.js';
import InEngineInspectorScene from './InEngineInspectorScene.js';

bootLateSample({
  SceneClass: InEngineInspectorScene,
  controls: [
    { id: 'inspect-player', action: ({ scene }) => scene.inspectPlayer() },
    { id: 'inspect-system', action: ({ scene }) => scene.inspectSystem() },
  ],
});

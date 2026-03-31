/*
Toolbox Aid
David Quesenberry
03/22/2026
main.js
*/
import { bootLateSample } from '../../_shared/lateSampleBootstrap.js';
import DeveloperConsoleScene from './DeveloperConsoleScene.js';

bootLateSample({
  SceneClass: DeveloperConsoleScene,
  controls: [
    { id: 'console-help', action: ({ scene }) => scene.run('help') },
    { id: 'console-heal', action: ({ scene }) => scene.run('heal 3') },
    { id: 'console-unknown', action: ({ scene }) => scene.run('teleport') },
  ],
});

/*
Toolbox Aid
David Quesenberry
03/22/2026
main.js
*/
import { bootLateSample } from '../_shared/lateSampleBootstrap.js';
import LiveTuningHotReloadScene from './LiveTuningHotReloadScene.js';

bootLateSample({
  SceneClass: LiveTuningHotReloadScene,
  controls: [
    { id: 'tune-speed', action: ({ scene }) => scene.tune(4) },
    { id: 'tune-speed-fast', action: ({ scene }) => scene.tune(8) },
  ],
});

/* Toolbox Aid David Quesenberry 03/22/2026 main.js */
import { bootLateSample } from '../_shared/lateSampleBootstrap.js';
import RegressionPlaybackHarnessScene from './RegressionPlaybackHarnessScene.js';

bootLateSample({
  SceneClass: RegressionPlaybackHarnessScene,
  controls: [
    { id: 'regression-play', action: ({ scene }) => scene.play() },
  ],
});

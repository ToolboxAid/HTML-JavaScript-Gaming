/* Toolbox Aid David Quesenberry 03/22/2026 main.js */
import { bootLateSample } from '../../shared/lateSampleBootstrap.js';
import AutomatedTestRunnerScene from './AutomatedTestRunnerScene.js';

bootLateSample({
  SceneClass: AutomatedTestRunnerScene,
  controls: [
    { id: 'tests-run', action: ({ scene }) => scene.runTests() },
  ],
});

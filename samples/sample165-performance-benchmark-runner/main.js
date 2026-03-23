import { bootLateSample } from '../_shared/lateSampleBootstrap.js';
import PerformanceBenchmarkRunnerScene from './PerformanceBenchmarkRunnerScene.js';

bootLateSample({
  SceneClass: PerformanceBenchmarkRunnerScene,
  controls: [
    { id: 'bench-run', action: ({ scene }) => scene.runBenches() },
  ],
});

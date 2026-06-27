import { bootLateSample } from '../../shared/lateSampleBootstrap.js';
import CIValidationFlowScene from './CIValidationFlowScene.js';

bootLateSample({
  SceneClass: CIValidationFlowScene,
  controls: [
    { id: 'ci-green', action: ({ scene }) => scene.run(true) },
    { id: 'ci-red', action: ({ scene }) => scene.run(false) },
  ],
});

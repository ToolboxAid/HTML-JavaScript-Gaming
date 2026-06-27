import { bootLateSample } from '../../shared/lateSampleBootstrap.js';
import ContentValidationPipelineScene from './ContentValidationPipelineScene.js';

bootLateSample({
  SceneClass: ContentValidationPipelineScene,
  controls: [
    { id: 'content-good', action: ({ scene }) => scene.good() },
    { id: 'content-bad', action: ({ scene }) => scene.bad() },
  ],
});

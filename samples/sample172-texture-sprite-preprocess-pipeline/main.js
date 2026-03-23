import { bootLateSample } from '../_shared/lateSampleBootstrap.js';
import TextureSpritePreprocessPipelineScene from './TextureSpritePreprocessPipelineScene.js';

bootLateSample({
  SceneClass: TextureSpritePreprocessPipelineScene,
  controls: [
    { id: 'texture-run', action: ({ scene }) => scene.run() },
  ],
});

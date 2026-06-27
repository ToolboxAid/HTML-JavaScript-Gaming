import { bootLateSample } from '../../shared/lateSampleBootstrap.js';
import TextureSpritePreprocessPipelineScene from './TextureSpritePreprocessPipelineScene.js';

// Keep explicit palette JSON discoverable by audit tooling.
const SAMPLE_1414_PALETTE_PATH = './sample.1414.palette.json';
void SAMPLE_1414_PALETTE_PATH;

bootLateSample({
  SceneClass: TextureSpritePreprocessPipelineScene,
  controls: [
    { id: 'texture-run', action: ({ scene }) => scene.run() },
  ],
});

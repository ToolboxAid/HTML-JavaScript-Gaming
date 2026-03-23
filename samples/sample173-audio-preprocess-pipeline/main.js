import { bootLateSample } from '../_shared/lateSampleBootstrap.js';
import AudioPreprocessPipelineScene from './AudioPreprocessPipelineScene.js';

bootLateSample({
  SceneClass: AudioPreprocessPipelineScene,
  controls: [
    { id: 'audio-run', action: ({ scene }) => scene.run() },
  ],
});

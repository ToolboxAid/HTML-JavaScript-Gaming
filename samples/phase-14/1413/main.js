import { bootLateSample } from '../../shared/lateSampleBootstrap.js';
import AssetImportPipelineScene from './AssetImportPipelineScene.js';

bootLateSample({
  SceneClass: AssetImportPipelineScene,
  controls: [
    { id: 'import-run', action: ({ scene }) => scene.runImport() },
  ],
});

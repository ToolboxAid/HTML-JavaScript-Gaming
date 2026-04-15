import { bootLateSample } from '../../shared/lateSampleBootstrap.js';
import BuildAssetManifestSystemScene from './BuildAssetManifestSystemScene.js';

bootLateSample({
  SceneClass: BuildAssetManifestSystemScene,
  controls: [
    { id: 'manifest-run', action: ({ scene }) => scene.run() },
  ],
});

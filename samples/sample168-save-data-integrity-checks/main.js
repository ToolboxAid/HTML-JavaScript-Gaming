import { bootLateSample } from '../_shared/lateSampleBootstrap.js';
import SaveDataIntegrityChecksScene from './SaveDataIntegrityChecksScene.js';

bootLateSample({
  SceneClass: SaveDataIntegrityChecksScene,
  controls: [
    { id: 'integrity-seal', action: ({ scene }) => scene.seal() },
    { id: 'integrity-tamper', action: ({ scene }) => scene.tamper() },
  ],
});

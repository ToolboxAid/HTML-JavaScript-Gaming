import { bootLateSample } from '../../shared/lateSampleBootstrap.js';
import PacketValidationAntiCheatScene from './PacketValidationAntiCheatScene.js';

bootLateSample({
  SceneClass: PacketValidationAntiCheatScene,
  controls: [
    { id: 'packet-valid', action: ({ scene }) => scene.validateGood() },
    { id: 'packet-bad', action: ({ scene }) => scene.validateBad() },
  ],
});

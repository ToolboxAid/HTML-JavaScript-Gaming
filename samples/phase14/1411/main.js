import { bootLateSample } from '../../_shared/lateSampleBootstrap.js';
import PermissionsCapabilityGatingScene from './PermissionsCapabilityGatingScene.js';

bootLateSample({
  SceneClass: PermissionsCapabilityGatingScene,
  controls: [
    { id: 'perm-admin', action: ({ scene }) => scene.setRole('admin') },
    { id: 'perm-guest', action: ({ scene }) => scene.setRole('guest') },
  ],
});

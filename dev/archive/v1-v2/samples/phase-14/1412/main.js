import { bootLateSample } from '../../shared/lateSampleBootstrap.js';
import TrustSessionValidationScene from './TrustSessionValidationScene.js';

bootLateSample({
  SceneClass: TrustSessionValidationScene,
  controls: [
    { id: 'session-fresh', action: ({ scene }) => scene.validateFresh() },
    { id: 'session-stale', action: ({ scene }) => scene.validateStale() },
  ],
});

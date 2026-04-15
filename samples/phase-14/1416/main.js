import { bootLateSample } from '../../shared/lateSampleBootstrap.js';
import ContentVersioningMigrationScene from './ContentVersioningMigrationScene.js';

bootLateSample({
  SceneClass: ContentVersioningMigrationScene,
  controls: [
    { id: 'migration-run', action: ({ scene }) => scene.run() },
  ],
});

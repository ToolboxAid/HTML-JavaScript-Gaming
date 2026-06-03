/*
Toolbox Aid
David Quesenberry
03/22/2026
main.js
*/
import { bootLateSample } from '../../shared/lateSampleBootstrap.js';
import SceneGraphEntityHierarchyViewerScene from './SceneGraphEntityHierarchyViewerScene.js';

bootLateSample({
  SceneClass: SceneGraphEntityHierarchyViewerScene,
  controls: [
    { id: 'hierarchy-refresh', action: ({ scene }) => scene.refresh() },
  ],
});

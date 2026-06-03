/*
Toolbox Aid
David Quesenberry
03/22/2026
main.js
*/
import { bootLateSample } from '../../shared/lateSampleBootstrap.js';
import PropertyEditorScene from './PropertyEditorScene.js';

bootLateSample({
  SceneClass: PropertyEditorScene,
  controls: [
    { id: 'prop-speed', action: ({ scene }) => scene.setSpeed() },
    { id: 'prop-color', action: ({ scene }) => scene.setColor() },
  ],
});

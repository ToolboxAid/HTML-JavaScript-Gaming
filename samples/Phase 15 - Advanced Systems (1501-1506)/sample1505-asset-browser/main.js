/*
Toolbox Aid
David Quesenberry
03/22/2026
main.js
*/
import { bootLateSample } from '../../_shared/lateSampleBootstrap.js';
import AssetBrowserScene from './AssetBrowserScene.js';

bootLateSample({
  SceneClass: AssetBrowserScene,
  controls: [
    { id: 'asset-texture', action: ({ scene }) => scene.select('hero-texture') },
    { id: 'asset-audio', action: ({ scene }) => scene.select('menu-theme') },
  ],
});

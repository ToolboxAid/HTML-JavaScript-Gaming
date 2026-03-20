import Engine from '../../../engine/v2/core/Engine.js';
import BouncerScene from './BouncerScene.js';

const canvas = document.getElementById('game');

const engine = new Engine({
  canvas,
  width: 960,
  height: 540,
});

engine.setScene(new BouncerScene());
engine.start();

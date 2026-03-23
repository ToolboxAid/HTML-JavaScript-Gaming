/*
Toolbox Aid
David Quesenberry
03/21/2026
TransitionScene.js
*/
import Scene from './Scene.js';
import SceneTransition from './SceneTransition.js';

export default class TransitionScene extends Scene {
  constructor({ fromScene, toScene, transition = null } = {}) {
    super();
    this.fromScene = fromScene;
    this.toScene = toScene;
    this.transition = transition ?? new SceneTransition();
  }

  enter(_engine) {
    this.transition.reset();
  }

  update(dtSeconds, engine) {
    this.transition.advance(dtSeconds);

    if (this.transition.isComplete()) {
      engine.setScene(this.toScene);
    }
  }

  render(renderer, engine, alpha) {
    const progress = this.transition.getProgress();
    const activeScene = this.getRenderableScene(progress);

    if (activeScene && typeof activeScene.render === 'function') {
      activeScene.render(renderer, engine, alpha);
    }

    this.renderFadeOverlay(renderer, progress);
  }

  getRenderableScene(progress) {
    if (!this.toScene) {
      return this.fromScene;
    }

    if (!this.fromScene) {
      return this.toScene;
    }

    return progress < 0.5 ? this.fromScene : this.toScene;
  }

  renderFadeOverlay(renderer, progress) {
    if (
      !renderer ||
      typeof renderer.drawRect !== 'function' ||
      typeof renderer.getCanvasSize !== 'function'
    ) {
      return;
    }

    const opacity = progress < 0.5 ? progress * 2 : (1 - progress) * 2;
    const clampedOpacity = Math.max(0, Math.min(1, opacity));

    if (clampedOpacity <= 0) {
      return;
    }

    const { width, height } = renderer.getCanvasSize();
    renderer.drawRect(0, 0, width, height, `rgba(0, 0, 0, ${clampedOpacity})`);
  }
}

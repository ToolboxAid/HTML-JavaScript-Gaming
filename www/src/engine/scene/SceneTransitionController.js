/*
Toolbox Aid
David Quesenberry
03/22/2026
SceneTransitionController.js
*/
import SceneTransition from './SceneTransition.js';
import TransitionScene from './TransitionScene.js';

export default class SceneTransitionController {
  create({ fromScene, toScene, durationSeconds = 0.35 } = {}) {
    return new TransitionScene({
      fromScene,
      toScene,
      transition: new SceneTransition({ durationSeconds }),
    });
  }

  transitionTo(engine, { fromScene, toScene, durationSeconds = 0.35 } = {}) {
    const transitionScene = this.create({ fromScene, toScene, durationSeconds });
    engine.setScene(transitionScene);
    return transitionScene;
  }
}

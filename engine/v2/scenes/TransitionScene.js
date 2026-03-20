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

    render(context, engine, alpha) {
        const progress = this.transition.getProgress();

        if (this.fromScene) {
            context.save();
            context.globalAlpha = 1 - progress;
            this.fromScene.render(context, engine, alpha);
            context.restore();
        }

        if (this.toScene) {
            context.save();
            context.globalAlpha = progress;
            this.toScene.render(context, engine, alpha);
            context.restore();
        }
    }
}

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
        const ctx = renderer?.ctx;

        if (!ctx) {
            if (this.fromScene) {
                this.fromScene.render(renderer, engine, alpha);
            }
            return;
        }

        if (this.fromScene) {
            ctx.save();
            ctx.globalAlpha = 1 - progress;
            this.fromScene.render(renderer, engine, alpha);
            ctx.restore();
        }

        if (this.toScene) {
            ctx.save();
            ctx.globalAlpha = progress;
            this.toScene.render(renderer, engine, alpha);
            ctx.restore();
        }
    }
}

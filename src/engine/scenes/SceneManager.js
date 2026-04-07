/*
Toolbox Aid
David Quesenberry
03/21/2026
SceneManager.js
*/
import { invariant } from "../utils/invariant.js";
import Scene from "./Scene.js";

export default class SceneManager {
    constructor() {
        this.activeScene = null;
    }

    setScene(scene, engine) {
        invariant(scene instanceof Scene, "SceneManager.setScene requires a Scene instance.");

        if (this.activeScene) {
            this.activeScene.exit(engine);
        }

        this.activeScene = scene;
        this.activeScene.enter(engine);
    }

    update(dtSeconds, engine) {
        if (!this.activeScene) {
            return;
        }
        this.activeScene.update(dtSeconds, engine);
    }

    render(context, engine, alpha) {
        if (!this.activeScene) {
            return;
        }
        this.activeScene.render(context, engine, alpha);
    }
}

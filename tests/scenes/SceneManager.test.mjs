/*
Toolbox Aid
David Quesenberry
03/21/2026
SceneManager.test.mjs
*/
import assert from "node:assert/strict";
import Scene from "../../src/engine/scenes/Scene.js";
import SceneManager from "../../src/engine/scenes/SceneManager.js";

class TestScene extends Scene {
    constructor(name, log) {
        super();
        this.name = name;
        this.log = log;
    }

    enter() {
        this.log.push(`${this.name}:enter`);
    }

    exit() {
        this.log.push(`${this.name}:exit`);
    }

    update(dtSeconds) {
        this.log.push(`${this.name}:update:${dtSeconds.toFixed(3)}`);
    }

    render(_context, _engine, alpha) {
        this.log.push(`${this.name}:render:${alpha.toFixed(2)}`);
    }
}

export function run() {
    const log = [];
    const manager = new SceneManager();
    const a = new TestScene("a", log);
    const b = new TestScene("b", log);

    manager.setScene(a, {});
    manager.update(1 / 60, {});
    manager.render({}, {}, 0.25);
    manager.setScene(b, {});

    assert.deepEqual(log, [
        "a:enter",
        "a:update:0.017",
        "a:render:0.25",
        "a:exit",
        "b:enter",
    ]);
}

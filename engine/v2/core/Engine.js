import { invariant } from "../utils/invariant.js";
import FrameClock from "./FrameClock.js";
import FixedTicker from "./FixedTicker.js";
import CanvasSurface from "./CanvasSurface.js";
import SceneManager from "../scenes/SceneManager.js";
import InputService from "../input/InputService.js";

export default class Engine {
    constructor({
        canvas,
        width = 800,
        height = 600,
        fixedStepMs = 1000 / 60,
        frameClock = null,
        ticker = null,
        sceneManager = null,
        input = null,
        requestFrame = (callback) => window.requestAnimationFrame(callback),
        cancelFrame = (id) => window.cancelAnimationFrame(id),
    } = {}) {
        invariant(canvas, "Engine requires a canvas element.");

        this.surface = new CanvasSurface({ canvas, width, height });
        this.frameClock = frameClock ?? new FrameClock();
        this.ticker = ticker ?? new FixedTicker({ stepMs: fixedStepMs });
        this.sceneManager = sceneManager ?? new SceneManager();
        this.input = input ?? new InputService();
        this.requestFrame = requestFrame;
        this.cancelFrame = cancelFrame;

        this.isRunning = false;
        this.frameRequestId = null;
        this.loop = this.loop.bind(this);
    }

    setScene(scene) {
        this.sceneManager.setScene(scene, this);
    }

    start(startTimeMs) {
        if (this.isRunning) {
            return;
        }

        this.isRunning = true;
        this.input.attach();
        this.input.reset();
        this.frameClock.reset(startTimeMs);
        this.ticker.reset();
        this.frameRequestId = this.requestFrame(this.loop);
    }

    stop() {
        if (!this.isRunning) {
            return;
        }

        this.isRunning = false;
        this.input.detach();
        if (this.frameRequestId !== null) {
            this.cancelFrame(this.frameRequestId);
            this.frameRequestId = null;
        }
    }

    loop(timeMs) {
        if (!this.isRunning) {
            return;
        }

        this.input.update();
        const { deltaMs } = this.frameClock.tick(timeMs);
        const { alpha } = this.ticker.advance(deltaMs, (dtSeconds) => {
            this.sceneManager.update(dtSeconds, this);
        });

        this.surface.clear();
        this.sceneManager.render(this.surface.context, this, alpha);
        this.frameRequestId = this.requestFrame(this.loop);
    }
}

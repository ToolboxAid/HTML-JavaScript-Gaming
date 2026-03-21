import { invariant } from "../utils/invariant.js";

export default class CanvasSurface {
    constructor({ canvas, width = 800, height = 600, contextType = "2d", contextOptions = {} } = {}) {
        invariant(canvas, "CanvasSurface requires a canvas element.");

        this.canvas = canvas;
        this.context = canvas.getContext(contextType, contextOptions);
        invariant(this.context, `CanvasSurface failed to create a ${contextType} context.`);

        this.resize(width, height);
    }

    resize(width, height) {
        invariant(width > 0 && height > 0, "CanvasSurface width and height must be greater than zero.");
        this.canvas.width = width;
        this.canvas.height = height;
    }

    clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    get size() {
        return {
            width: this.canvas.width,
            height: this.canvas.height,
        };
    }
}

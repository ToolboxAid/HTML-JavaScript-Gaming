import Scene from "../../../engine/v2/scenes/Scene.js";
import { Theme, ThemeTokens } from "../../../engine/v2/theme/index.js";

const theme = new Theme(ThemeTokens);

export default class BouncerScene extends Scene {
    constructor() {
        super();
        this.x = 80;
        this.previousX = 80;
        this.velocity = 180;
        this.radius = 20;
    }

    update(dtSeconds, engine) {
        this.previousX = this.x;
        this.x += this.velocity * dtSeconds;

        const { width } = engine.surface.size;
        const minX = this.radius;
        const maxX = width - this.radius;

        if (this.x <= minX) {
            this.x = minX;
            this.velocity *= -1;
        }

        if (this.x >= maxX) {
            this.x = maxX;
            this.velocity *= -1;
        }
    }

    render(context, engine, alpha) {
        const { width, height } = engine.surface.size;
        const drawX = this.previousX + (this.x - this.previousX) * alpha;

        context.fillStyle = theme.getColor("canvasBackground");
        context.fillRect(0, 0, width, height);

        context.strokeStyle = "#334155";
        context.lineWidth = 2;
        context.strokeRect(40, height / 2 - 30, width - 80, 60);

        context.beginPath();
        context.fillStyle = theme.getColor("actorFill");
        context.arc(drawX, height / 2, this.radius, 0, Math.PI * 2);
        context.fill();

        context.fillStyle = "#e5e7eb";
        context.font = "16px monospace";
        context.fillText("Engine V2 Sample 01", 20, 28);
        context.fillText(`alpha=${alpha.toFixed(2)}`, 20, 52);
        context.fillText("Concern split: engine / timing / scene / surface", 20, height - 20);
    }
}

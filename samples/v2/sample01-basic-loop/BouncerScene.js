import Scene from "../../../engine/v2/scenes/Scene.js";
import { Theme, ThemeTokens } from "../../../engine/v2/theme/index.js";

const theme = new Theme(ThemeTokens);

export default class BouncerScene extends Scene {
    constructor() {
        super();
        this.radius = 18;

        this.bounds = {
            x: 60,
            y: 180,
            width: 840,
            height: 280,
        };

        this.x = this.bounds.x + 80;
        this.y = this.bounds.y + 70;
        this.previousX = this.x;
        this.previousY = this.y;
        this.velocityX = 220;
        this.velocityY = 160;
    }

    update(dtSeconds) {
        this.previousX = this.x;
        this.previousY = this.y;

        this.x += this.velocityX * dtSeconds;
        this.y += this.velocityY * dtSeconds;

        const minX = this.bounds.x + this.radius;
        const maxX = this.bounds.x + this.bounds.width - this.radius;
        const minY = this.bounds.y + this.radius;
        const maxY = this.bounds.y + this.bounds.height - this.radius;

        if (this.x <= minX) {
            this.x = minX;
            this.velocityX *= -1;
        }

        if (this.x >= maxX) {
            this.x = maxX;
            this.velocityX *= -1;
        }

        if (this.y <= minY) {
            this.y = minY;
            this.velocityY *= -1;
        }

        if (this.y >= maxY) {
            this.y = maxY;
            this.velocityY *= -1;
        }
    }

    render(ctx, engine, alpha) {
        const { width, height } = engine.surface.size;
        const drawX = this.previousX + (this.x - this.previousX) * alpha;
        const drawY = this.previousY + (this.y - this.previousY) * alpha;

        ctx.fillStyle = theme.getColor("canvasBackground");
        ctx.fillRect(0, 0, width, height);

        // draw inner bounds (10px inset)
        const pad = 10;
        const w = ctx.canvas.width;
        const h = ctx.canvas.height;

        ctx.strokeStyle = "#dddddd";
        ctx.lineWidth = 2;
        ctx.strokeRect(pad, pad, w - pad * 2, h - pad * 2);

        ctx.strokeStyle = "#d8d5ff";
        ctx.lineWidth = 3;
        ctx.strokeRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);

        ctx.beginPath();
        ctx.fillStyle = theme.getColor("actorFill");
        ctx.arc(drawX, drawY, this.radius, 0, Math.PI * 2);
        ctx.fill();

        const textX = 40;
        const textY = 48;
        const lineHeight = 24;

        ctx.fillStyle = theme.getColor("textCanvs");
        ctx.font = "16px monospace";
        ctx.fillText("Engine V2 Sample01", textX, textY + lineHeight * 0);
        ctx.fillText("Demonstrates the core engine loop and bounded motion", textX, textY + lineHeight * 1);
        ctx.fillText("The ball updates every frame and bounces inside the rectangle", textX, textY + lineHeight * 2);
        ctx.fillText("Observe edge response and interpolated motion inside the play area", textX, textY + lineHeight * 3);
        ctx.fillText("This sample keeps motion logic inside the scene", textX, textY + lineHeight * 4);
    }
}

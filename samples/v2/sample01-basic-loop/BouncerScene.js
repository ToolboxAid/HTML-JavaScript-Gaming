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

    render(context, engine, alpha) {
        const { width, height } = engine.surface.size;
        const drawX = this.previousX + (this.x - this.previousX) * alpha;
        const drawY = this.previousY + (this.y - this.previousY) * alpha;

        context.fillStyle = theme.getColor("canvasBackground");
        context.fillRect(0, 0, width, height);

        context.strokeStyle = "#d8d5ff";
        context.lineWidth = 3;
        context.strokeRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);

        context.beginPath();
        context.fillStyle = theme.getColor("actorFill");
        context.arc(drawX, drawY, this.radius, 0, Math.PI * 2);
        context.fill();

        const textX = 40;
        const textY = 48;
        const lineHeight = 24;

        context.fillStyle = theme.getColor("textCanvs");
        context.font = "16px monospace";
        context.fillText("Engine V2 Sample01", textX, textY + lineHeight * 0);
        context.fillText("Demonstrates the core engine loop and bounded motion", textX, textY + lineHeight * 1);
        context.fillText("The ball updates every frame and bounces inside the rectangle", textX, textY + lineHeight * 2);
        context.fillText("Observe edge response and interpolated motion inside the play area", textX, textY + lineHeight * 3);
        context.fillText("This sample keeps motion logic inside the scene", textX, textY + lineHeight * 4);
    }
}

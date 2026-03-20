import Scene from '../../../engine/v2/scenes/Scene.js';
import { Theme, ThemeTokens } from '../../../engine/v2/theme/index.js';

const theme = new Theme(ThemeTokens);

export default class PlayScene extends Scene {
    constructor({ createIntroScene }) {
        super();
        this.createIntroScene = createIntroScene;
        this.bounds = {
            x: 180,
            y: 170,
            width: 600,
            height: 230,
        };
        this.actor = {
            x: 210,
            y: 285,
            radius: 18,
            speed: 230,
            direction: 1,
        };
        this.textStartX = 40;
        this.textStartY = 40;
        this.textLineHeight = 24;
    }

    update(deltaTime, engine) {
        if (engine?.input?.isPressed?.('Escape')) {
            engine.setScene(this.createIntroScene());
            return;
        }

        this.actor.x += this.actor.speed * this.actor.direction * deltaTime;

        const minX = this.bounds.x + this.actor.radius;
        const maxX = this.bounds.x + this.bounds.width - this.actor.radius;

        if (this.actor.x <= minX) {
            this.actor.x = minX;
            this.actor.direction = 1;
        }

        if (this.actor.x >= maxX) {
            this.actor.x = maxX;
            this.actor.direction = -1;
        }
    }

    render(ctx) {
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;

        ctx.fillStyle = '#2d1657';
        ctx.fillRect(0, 0, width, height);

        // draw inner bounds (10px inset)
        const pad = 10;
        const w = ctx.canvas.width;
        const h = ctx.canvas.height;

        ctx.strokeStyle = "#dddddd";
        ctx.lineWidth = 2;
        ctx.strokeRect(pad, pad, w - pad * 2, h - pad * 2);

        ctx.strokeStyle = '#ffd8a8';
        ctx.lineWidth = 3;
        ctx.strokeRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);


        ctx.beginPath();
        ctx.fillStyle = theme.getColor('actorFill');
        ctx.arc(this.actor.x, this.actor.y, this.actor.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#dddddd';
        ctx.font = '16px monospace';
        ctx.fillText('Engine V2 Sample05', this.textStartX, this.textStartY);

        const lines = [
            'Demonstrates active scene behavior after a transition',
            'Press Escape to return to IntroScene',
            'Observe that visuals and behavior belong to the current scene only',
            'This sample keeps scene changes inside the scene boundary',
        ];

        lines.forEach((line, index) => {
            ctx.fillText(line, this.textStartX, this.textStartY + this.textLineHeight * (index + 1));
        });
    }
}

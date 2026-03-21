/*
Toolbox Aid
David Quesenberry
03/21/2026
PlayScene.js
*/
import Scene from '../../engine/scenes/Scene.js';
import { Theme, ThemeTokens } from '../../engine/theme/index.js';

const theme = new Theme(ThemeTokens);

export default class PlayScene extends Scene {
    constructor({ createIntroScene, createTransitionScene }) {
        super();
        this.createIntroScene = createIntroScene;
        this.createTransitionScene = createTransitionScene;
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
        this.textStartX = 60;
        this.textStartY = 36;
        this.textLineHeight = 24;
    }

    update(deltaTime, engine) {
        if (engine?.input?.isPressed?.('Escape')) {
            engine.setScene(this.createTransitionScene({
                fromScene: this,
                toScene: this.createIntroScene(),
            }));
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

    render(renderer) {
        const { width, height } = renderer.getCanvasSize();

        renderer.clear('#2d1657');

        const pad = 10;
        renderer.strokeRect(pad, pad, width - pad * 2, height - pad * 2, '#dddddd', 2);
        renderer.strokeRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height, '#ffd8a8', 3);
        renderer.drawCircle(this.actor.x, this.actor.y, this.actor.radius, theme.getColor('actorFill'));

        renderer.drawText('Engine V2 Sample05', this.textStartX, this.textStartY, {
            color: '#dddddd',
            font: '16px monospace',
        });

        const lines = [
            'Demonstrates active scene behavior after a transition',
            'Press Escape to return to IntroScene',
            'Observe that visuals and behavior belong to the current scene only',
            'This sample keeps scene changes inside the scene boundary',
        ];

        lines.forEach((line, index) => {
            renderer.drawText(line, this.textStartX, this.textStartY + this.textLineHeight * (index + 1), {
                color: '#dddddd',
                font: '16px monospace',
            });
        });
    }
}

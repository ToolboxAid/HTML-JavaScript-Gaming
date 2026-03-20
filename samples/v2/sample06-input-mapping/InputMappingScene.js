import Scene from '../../../engine/v2/scenes/Scene.js';
import { Theme, ThemeTokens } from '../../../engine/v2/theme/index.js';

const theme = new Theme(ThemeTokens);

export default class InputMappingScene extends Scene {
    constructor() {
        super();
        this.position = { x: 480, y: 320 };
        this.previousPosition = { ...this.position };
        this.size = 40;
        this.speed = 240;
        this.bounds = { x: 40, y: 150, width: 880, height: 290 };
        this.textStartX = 40;
        this.textStartY = 38;
        this.textLineHeight = 24;
    }

    update(dtSeconds, engine) {
        this.previousPosition = { ...this.position };

        let moveX = 0;
        let moveY = 0;

        if (engine.input.isActionDown('moveLeft')) {
            moveX -= 1;
        }

        if (engine.input.isActionDown('moveRight')) {
            moveX += 1;
        }

        if (engine.input.isActionDown('moveUp')) {
            moveY -= 1;
        }

        if (engine.input.isActionDown('moveDown')) {
            moveY += 1;
        }

        this.position.x += moveX * this.speed * dtSeconds;
        this.position.y += moveY * this.speed * dtSeconds;

        const half = this.size / 2;
        const minX = this.bounds.x + half;
        const maxX = this.bounds.x + this.bounds.width - half;
        const minY = this.bounds.y + half;
        const maxY = this.bounds.y + this.bounds.height - half;
        this.position.x = Math.max(minX, Math.min(maxX, this.position.x));
        this.position.y = Math.max(minY, Math.min(maxY, this.position.y));
    }

    render(ctx, engine, alpha) {
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        const drawX = this.previousPosition.x + (this.position.x - this.previousPosition.x) * alpha;
        const drawY = this.previousPosition.y + (this.position.y - this.previousPosition.y) * alpha;
        const half = this.size / 2;

        ctx.fillStyle = theme.getColor('canvasBackground');
        ctx.fillRect(0, 0, width, height);

        const pad = 10;
        ctx.strokeStyle = '#dddddd';
        ctx.lineWidth = 2;
        ctx.strokeRect(pad, pad, width - pad * 2, height - pad * 2);

        ctx.strokeStyle = '#d8d5ff';
        ctx.lineWidth = 3;
        ctx.strokeRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);

        ctx.fillStyle = theme.getColor('actorFill');
        ctx.fillRect(drawX - half, drawY - half, this.size, this.size);

        ctx.fillStyle = '#dddddd';
        ctx.font = '16px monospace';

        const lines = [
            'Engine V2 Sample06',
            'Demonstrates input mapping from physical keys to actions',
            'Use Arrow keys or WASD to move the box in four directions',
            'Observe multiple physical keys mapped to the same movement actions',
            'This sample separates input intent from physical keyboard bindings',
        ];

        lines.forEach((line, index) => {
            ctx.fillText(line, this.textStartX, this.textStartY + this.textLineHeight * index);
        });

        const actionSnapshot = engine.input.getActionSnapshot();
        const statusLines = [
            `moveLeft=${actionSnapshot.moveLeft?.down ? 'down' : 'up'} | moveRight=${actionSnapshot.moveRight?.down ? 'down' : 'up'}`,
            `moveUp=${actionSnapshot.moveUp?.down ? 'down' : 'up'} | moveDown=${actionSnapshot.moveDown?.down ? 'down' : 'up'}`,
            `position=(${Math.round(this.position.x)}, ${Math.round(this.position.y)})`,
        ];

        statusLines.forEach((line, index) => {
            ctx.fillText(line, this.textStartX, height - 68 + index * 22);
        });
    }
}

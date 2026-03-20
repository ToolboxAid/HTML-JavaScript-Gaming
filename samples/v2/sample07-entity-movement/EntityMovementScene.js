import Scene from '../../../engine/v2/scenes/Scene.js';
import { Theme, ThemeTokens } from '../../../engine/v2/theme/index.js';
import { Entity, Transform, Velocity, Bounds } from '../../../engine/v2/entity/index.js';

const theme = new Theme(ThemeTokens);

export default class EntityMovementScene extends Scene {
    constructor() {
        super();
        this.playArea = { x: 40, y: 150, width: 880, height: 290 };
        this.textStartX = 40;
        this.textStartY = 38;
        this.textLineHeight = 24;
        this.speed = 240;
        this.entity = new Entity({
            transform: new Transform({ x: 480, y: 310 }),
            velocity: new Velocity(),
            bounds: new Bounds({ width: 40, height: 40 }),
        });
    }

    update(dtSeconds, engine) {
        this.entity.snapshot();

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

        this.entity.velocity.set(moveX * this.speed, moveY * this.speed);
        this.entity.integrate(dtSeconds);
        this.entity.bounds.clampCenter(this.entity.transform.position, this.playArea);
    }

    render(ctx, engine, alpha) {
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        const current = this.entity.transform.position;
        const previous = this.entity.transform.previousPosition;
        const drawX = previous.x + (current.x - previous.x) * alpha;
        const drawY = previous.y + (current.y - previous.y) * alpha;
        const drawWidth = this.entity.bounds.width;
        const drawHeight = this.entity.bounds.height;

        ctx.fillStyle = theme.getColor('canvasBackground');
        ctx.fillRect(0, 0, width, height);

        const pad = 10;
        ctx.strokeStyle = '#dddddd';
        ctx.lineWidth = 2;
        ctx.strokeRect(pad, pad, width - pad * 2, height - pad * 2);

        ctx.strokeStyle = '#d8d5ff';
        ctx.lineWidth = 3;
        ctx.strokeRect(this.playArea.x, this.playArea.y, this.playArea.width, this.playArea.height);

        ctx.fillStyle = theme.getColor('actorFill');
        ctx.fillRect(drawX - drawWidth / 2, drawY - drawHeight / 2, drawWidth, drawHeight);

        ctx.fillStyle = '#dddddd';
        ctx.font = '16px monospace';

        const lines = [
            'Engine V2 Sample07',
            'Demonstrates entity-based movement using Transform and Velocity',
            'Use Arrow keys or WASD to move the entity inside the play area',
            'Observe position and velocity separated from scene orchestration',
            'This sample introduces structured game state without coupling',
        ];

        lines.forEach((line, index) => {
            ctx.fillText(line, this.textStartX, this.textStartY + this.textLineHeight * index);
        });

        const actionSnapshot = engine.input.getActionSnapshot();
        const statusLines = [
            `velocity=(${this.entity.velocity.x.toFixed(0)}, ${this.entity.velocity.y.toFixed(0)})`,
            `position=(${Math.round(current.x)}, ${Math.round(current.y)})`,
            `actions: left=${actionSnapshot.moveLeft?.down ? 'down' : 'up'} right=${actionSnapshot.moveRight?.down ? 'down' : 'up'} up=${actionSnapshot.moveUp?.down ? 'down' : 'up'} down=${actionSnapshot.moveDown?.down ? 'down' : 'up'}`,
        ];

        statusLines.forEach((line, index) => {
            ctx.fillText(line, this.textStartX, height - 68 + index * 22);
        });
    }
}

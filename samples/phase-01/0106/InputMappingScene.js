/*
Toolbox Aid
David Quesenberry
03/21/2026
InputMappingScene.js
*/
import { Scene } from '/src/engine/scene/index.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';

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

    render(renderer, engine) {
        const { width, height } = renderer.getCanvasSize();
        const drawX = this.position.x;
        const drawY = this.position.y;
        const half = this.size / 2;

        renderer.clear(theme.getColor('canvasBackground'));

        const pad = 10;
        renderer.strokeRect(pad, pad, width - pad * 2, height - pad * 2, '#dddddd', 2);
        renderer.strokeRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height, '#d8d5ff', 3);
        renderer.drawRect(drawX - half, drawY - half, this.size, this.size, theme.getColor('actorFill'));

        const lines = [
            'Engine Sample 0106',
            'Demonstrates input mapping from physical keys to actions',
            'Use Arrow keys or WASD to move the box in four directions',
            'Observe multiple physical keys mapped to the same movement actions',
            'This sample separates input intent from physical keyboard bindings',
        ];

        lines.forEach((line, index) => {
            renderer.drawText(line, this.textStartX, this.textStartY + this.textLineHeight * index, {
                color: '#dddddd',
                font: '16px monospace',
            });
        });

        const actionSnapshot = engine.input.getActionSnapshot();
        const statusLines = [
            `moveLeft=${actionSnapshot.moveLeft?.down ? 'down' : 'up'} | moveRight=${actionSnapshot.moveRight?.down ? 'down' : 'up'}`,
            `moveUp=${actionSnapshot.moveUp?.down ? 'down' : 'up'} | moveDown=${actionSnapshot.moveDown?.down ? 'down' : 'up'}`,
            `position=(${Math.round(this.position.x)}, ${Math.round(this.position.y)})`,
        ];

        statusLines.forEach((line, index) => {
            renderer.drawText(line, this.textStartX, height - 68 + index * 22, {
                color: '#dddddd',
                font: '16px monospace',
            });
        });
    }
}

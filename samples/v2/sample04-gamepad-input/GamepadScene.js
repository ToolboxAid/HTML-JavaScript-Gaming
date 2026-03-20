import Scene from '../../../engine/v2/scenes/Scene.js';
import { Theme, ThemeTokens } from '../../../engine/v2/theme/index.js';

const theme = new Theme(ThemeTokens);

export default class GamepadScene extends Scene {
    constructor() {
        super();
        this.bounds = {
            x: 180,
            y: 160,
            width: 600,
            height: 260,
        };
        this.box = {
            x: 180 + 300 - 22,
            y: 160 + 130 - 22,
            size: 44,
            speed: 220,
        };
        this.textStartX = 40;
        this.textStartY = 40;
        this.textLineHeight = 24;
        this.deadzone = 0.2;
    }

    update(deltaTime, engine) {
        const gamepad = engine?.input?.getGamepad?.(0);
        if (!gamepad) {
            return;
        }

        const axisX = this.applyDeadzone(gamepad.axes[0] ?? 0);
        const axisY = this.applyDeadzone(gamepad.axes[1] ?? 0);
        const distance = this.box.speed * deltaTime;

        this.box.x += axisX * distance;
        this.box.y += axisY * distance;

        this.box.x = this.clamp(this.box.x, this.bounds.x, this.bounds.x + this.bounds.width - this.box.size);
        this.box.y = this.clamp(this.box.y, this.bounds.y, this.bounds.y + this.bounds.height - this.box.size);
    }

    render(ctx, engine) {
        const gamepadZero = engine?.input?.getGamepad?.(0);
        const allGamepads = engine?.input?.getGamepads?.() ?? [];
        const isActive = gamepadZero?.isDown?.(0) ?? false;
        const actorFill = isActive ? '#ffd166' : theme.getColor('actorFill');

        ctx.fillStyle = theme.getColor('canvasBackground');
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        ctx.strokeStyle = '#d8d5ff';
        ctx.lineWidth = 3;
        ctx.strokeRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);

        ctx.fillStyle = actorFill;
        ctx.fillRect(this.box.x, this.box.y, this.box.size, this.box.size);

        ctx.fillStyle = '#dddddd';
        ctx.font = '16px monospace';
        ctx.fillText('Engine V2 Sample04', this.textStartX, this.textStartY);

        const lines = [
            'Demonstrates the gamepad input boundary with concurrent controller snapshots',
            'Use the left stick on gamepad 0 to move the box and button 0 to change its state',
            `Observe connected gamepads: ${allGamepads.length} | gp0 axes: ${this.formatAxes(gamepadZero)}`,
            'This sample reads InputService state instead of polling navigator in the scene',
        ];

        lines.forEach((line, index) => {
            ctx.fillText(line, this.textStartX, this.textStartY + this.textLineHeight * (index + 1));
        });
    }

    applyDeadzone(value) {
        return Math.abs(value) < this.deadzone ? 0 : value;
    }

    formatAxes(gamepad) {
        if (!gamepad) {
            return 'disconnected';
        }

        const x = (gamepad.axes[0] ?? 0).toFixed(2);
        const y = (gamepad.axes[1] ?? 0).toFixed(2);
        return `(${x}, ${y})`;
    }

    clamp(value, min, max) {
        return Math.max(min, Math.min(value, max));
    }
}

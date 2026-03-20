import Scene from '../../../engine/v2/scenes/Scene.js';
import { Theme, ThemeTokens } from '../../../engine/v2/theme/index.js';

const theme = new Theme(ThemeTokens);

export default class MouseInputScene extends Scene {
    constructor() {
        super();
        this.bounds = {
            x: 180,
            y: 160,
            width: 600,
            height: 260,
        };
        this.marker = {
            x: this.bounds.x + this.bounds.width / 2,
            y: this.bounds.y + this.bounds.height / 2,
            radius: 18,
            altRadius: 28,
        };
        this.textStartX = 40;
        this.textStartY = 50;
        this.textLineHeight = 24;
    }

    update(_deltaTime, engine) {
        const input = engine?.input;
        if (!input) {
            return;
        }

        const position = input.getMousePosition();
        this.marker.x = this.clamp(position.x, this.bounds.x, this.bounds.x + this.bounds.width);
        this.marker.y = this.clamp(position.y, this.bounds.y, this.bounds.y + this.bounds.height);
    }

    render(ctx, engine) {
        const input = engine?.input;
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        const isActive = input?.isMouseDown(0) ?? false;
        const radius = isActive ? this.marker.altRadius : this.marker.radius;
        const position = input?.getMousePosition?.() ?? { x: 0, y: 0 };
        const delta = input?.getMouseDelta?.() ?? { x: 0, y: 0 };

        ctx.fillStyle = theme.getColor('canvasBackground');
        ctx.fillRect(0, 0, width, height);

        // draw inner bounds (10px inset)
        const pad = 10;
        const w = ctx.canvas.width;
        const h = ctx.canvas.height;

        ctx.strokeStyle = "#dddddd";
        ctx.lineWidth = 2;
        ctx.strokeRect(pad, pad, w - pad * 2, h - pad * 2);

        ctx.strokeStyle = '#d8d5ff';
        ctx.lineWidth = 3;
        ctx.strokeRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);

        ctx.beginPath();
        ctx.fillStyle = theme.getColor('actorFill');
        ctx.arc(this.marker.x, this.marker.y, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = theme.getColor('textCanvs');
        ctx.font = '16px monospace';
        ctx.fillText('Engine V2 Sample03', this.textStartX, this.textStartY);

        const lines = [
            'Demonstrates the mouse input boundary',
            'Move the mouse to reposition the marker and click to change its state',
            `Observe live position (${Math.round(position.x)}, ${Math.round(position.y)}) and delta (${Math.round(delta.x)}, ${Math.round(delta.y)})`,
            'This sample keeps pointer handling inside InputService and MouseState',
        ];

        lines.forEach((line, index) => {
            ctx.fillText(line, this.textStartX, this.textStartY + this.textLineHeight * (index + 1));
        });
    }

    clamp(value, min, max) {
        return Math.max(min, Math.min(value, max));
    }
}

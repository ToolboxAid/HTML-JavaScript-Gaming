import Scene from '../../../engine/v2/scenes/Scene.js';
import { Theme, ThemeTokens } from '../../../engine/v2/theme/index.js';

const theme = new Theme(ThemeTokens);

export default class MouseInputScene extends Scene {
    constructor() {
        super();
        this.bounds = {
            x: 180,
            y: 180,
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

    render(renderer, engine) {
        const input = engine?.input;
        const { width, height } = renderer.getCanvasSize();
        const isActive = input?.isMouseDown(0) ?? false;
        const radius = isActive ? this.marker.altRadius : this.marker.radius;
        const position = input?.getMousePosition?.() ?? { x: 0, y: 0 };
        const delta = input?.getMouseDelta?.() ?? { x: 0, y: 0 };

        renderer.clear(theme.getColor('canvasBackground'));

        const pad = 10;
        renderer.strokeRect(pad, pad, width - pad * 2, height - pad * 2, '#dddddd', 2);
        renderer.strokeRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height, '#d8d5ff', 3);
        renderer.drawCircle(this.marker.x, this.marker.y, radius, theme.getColor('actorFill'));

        renderer.drawText('Engine V2 Sample03', this.textStartX, this.textStartY, {
            color: theme.getColor('textCanvs'),
            font: '16px monospace',
        });

        const lines = [
            'Demonstrates the mouse input boundary',
            'Move the mouse to reposition the marker and click to change its state',
            `Observe live position (${Math.round(position.x)}, ${Math.round(position.y)}) and delta (${Math.round(delta.x)}, ${Math.round(delta.y)})`,
            'This sample keeps pointer handling inside InputService and MouseState',
        ];

        lines.forEach((line, index) => {
            renderer.drawText(line, this.textStartX, this.textStartY + this.textLineHeight * (index + 1), {
                color: theme.getColor('textCanvs'),
                font: '16px monospace',
            });
        });
    }

    clamp(value, min, max) {
        return Math.max(min, Math.min(value, max));
    }
}

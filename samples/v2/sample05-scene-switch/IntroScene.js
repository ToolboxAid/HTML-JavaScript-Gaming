import Scene from '../../../engine/v2/scenes/Scene.js';
import { Theme, ThemeTokens } from '../../../engine/v2/theme/index.js';

const theme = new Theme(ThemeTokens);

export default class IntroScene extends Scene {
    constructor({ createPlayScene }) {
        super();
        this.createPlayScene = createPlayScene;
        this.bounds = {
            x: 180,
            y: 170,
            width: 600,
            height: 230,
        };
        this.textStartX = 40;
        this.textStartY = 40;
        this.textLineHeight = 24;
        this.pulseSeconds = 0;
    }

    update(deltaTime, engine) {
        this.pulseSeconds += deltaTime;

        if (engine?.input?.isPressed?.('Enter')) {
            engine.setScene(this.createPlayScene());
        }
    }

    render(ctx, engine) {
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        const pulse = 0.5 + 0.5 * Math.sin(this.pulseSeconds * 3.5);
        const panelWidth = 220 + pulse * 22;
        const panelHeight = 90 + pulse * 10;
        const panelX = this.bounds.x + (this.bounds.width - panelWidth) / 2;
        const panelY = this.bounds.y + (this.bounds.height - panelHeight) / 2;

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

        ctx.fillStyle = 'rgba(226, 224, 255, 0.18)';
        ctx.fillRect(panelX, panelY, panelWidth, panelHeight);

        ctx.strokeStyle = '#ed9700';
        ctx.lineWidth = 2;
        ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);

        ctx.fillStyle = '#dddddd';
        ctx.font = '16px monospace';
        ctx.fillText('Engine V2 Sample05', this.textStartX, this.textStartY);

        const lines = [
            'Demonstrates scene lifecycle and scene switching',
            'Press Enter to move from IntroScene to PlayScene',
            'Observe that each scene owns its own update and render behavior',
            'SceneManager controls which scene is active',
        ];

        lines.forEach((line, index) => {
            ctx.fillText(line, this.textStartX, this.textStartY + this.textLineHeight * (index + 1));
        });

        // Center panel text inside the breathing panel
        const panelCenterX = panelX + panelWidth / 2;
        const panelCenterY = panelY + panelHeight / 2;

        const panelLines = [
            { text: 'IntroScene', font: '20px monospace' },
            { text: 'Press Enter to continue', font: '16px monospace' },
        ];

        const panelLineHeight = 28;
        const panelBlockHeight = panelLineHeight * panelLines.length;
        const panelTextStartY = panelCenterY - panelBlockHeight / 2 + panelLineHeight / 2;

        ctx.fillStyle = '#dddddd';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        panelLines.forEach((line, index) => {
            ctx.font = line.font;
            ctx.fillText(line.text, panelCenterX, panelTextStartY + panelLineHeight * index);
        });

        // restore defaults
        ctx.textAlign = 'start';
        ctx.textBaseline = 'alphabetic';
    }
}

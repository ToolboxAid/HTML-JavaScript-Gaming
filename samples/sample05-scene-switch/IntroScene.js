import Scene from '../../engine/scenes/Scene.js';
import { Theme, ThemeTokens } from '../../engine/theme/index.js';

const theme = new Theme(ThemeTokens);

export default class IntroScene extends Scene {
    constructor({ createPlayScene, createTransitionScene }) {
        super();
        this.createPlayScene = createPlayScene;
        this.createTransitionScene = createTransitionScene;
        this.bounds = {
            x: 180,
            y: 170,
            width: 600,
            height: 230,
        };
        this.textStartX = 60;
        this.textStartY = 36;
        this.textLineHeight = 24;
        this.pulseSeconds = 0;
    }

    update(deltaTime, engine) {
        this.pulseSeconds += deltaTime;

        if (engine?.input?.isPressed?.('Enter')) {
            engine.setScene(this.createTransitionScene({
                fromScene: this,
                toScene: this.createPlayScene(),
            }));
        }
    }

    render(renderer) {
        const { width, height } = renderer.getCanvasSize();
        const pulse = 0.5 + 0.5 * Math.sin(this.pulseSeconds * 3.5);
        const panelWidth = 220 + pulse * 22;
        const panelHeight = 90 + pulse * 10;
        const panelX = this.bounds.x + (this.bounds.width - panelWidth) / 2;
        const panelY = this.bounds.y + (this.bounds.height - panelHeight) / 2;

        renderer.clear(theme.getColor('canvasBackground'));

        const pad = 10;
        renderer.strokeRect(pad, pad, width - pad * 2, height - pad * 2, '#dddddd', 2);
        renderer.strokeRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height, '#d8d5ff', 3);
        renderer.drawRect(panelX, panelY, panelWidth, panelHeight, 'rgba(226, 224, 255, 0.18)');
        renderer.strokeRect(panelX, panelY, panelWidth, panelHeight, '#ed9700', 2);

        renderer.drawText('Engine V2 Sample05', this.textStartX, this.textStartY, {
            color: '#dddddd',
            font: '16px monospace',
        });

        const lines = [
            'Demonstrates scene lifecycle and scene switching',
            'Press Enter to move from IntroScene to PlayScene',
            'Observe that transition effects bridge the active scene handoff',
            'SceneManager controls which scene is active',
        ];

        lines.forEach((line, index) => {
            renderer.drawText(line, this.textStartX, this.textStartY + this.textLineHeight * (index + 1), {
                color: '#dddddd',
                font: '16px monospace',
            });
        });

        const panelCenterX = panelX + panelWidth / 2;
        const panelCenterY = panelY + panelHeight / 2;
        const panelLines = [
            { text: 'IntroScene', font: '20px monospace' },
            { text: 'Press Enter to continue', font: '16px monospace' },
        ];
        const panelLineHeight = 28;
        const panelBlockHeight = panelLineHeight * panelLines.length;
        const panelTextStartY = panelCenterY - panelBlockHeight / 2 + panelLineHeight / 2;

        panelLines.forEach((line, index) => {
            renderer.drawText(line.text, panelCenterX, panelTextStartY + panelLineHeight * index, {
                color: '#dddddd',
                font: line.font,
                textAlign: 'center',
                textBaseline: 'middle',
            });
        });
    }
}

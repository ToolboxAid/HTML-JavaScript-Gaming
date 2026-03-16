// ToolboxAid.com
// David Quesenberry
// 10/16/2024
// game.js

import DebugFlag from '../../../engine/utils/debugFlag.js';
import DebugLog from '../../../engine/utils/debugLog.js';
import {
    canvasConfig,
    performanceConfig,
    fullscreenConfig,
    particleSampleConfig,
    particleSampleUi,
    uiFont
} from './global.js';
import GameBase from '../../../engine/core/gameBase.js';
import CanvasUtils from '../../../engine/core/canvasUtils.js';
import CanvasText from '../../../engine/core/canvasText.js';
import ParticleExplosion from '../../../engine/renderers/particleExplosion.js';
import PrimitiveRenderer from '../../../engine/renderers/primitiveRenderer.js';
import RendererGuards from '../../../engine/renderers/rendererGuards.js';

class Game extends GameBase {
    // Enable debug mode: game.html?particle
    static DEBUG = DebugFlag.has('particle');

    constructor() {
        super(canvasConfig, performanceConfig, fullscreenConfig);
        this.explosions = [];
        this.lastExplosionTimeMs = 0;
    }

    async onInitialize() {
        this.explosions = [];
        this.lastExplosionTimeMs = Date.now();
        DebugLog.info(Game.DEBUG, 'Particle', 'Particle sample initialized');
    }

    createParticleExplosion(x, y, startRadius, endRadius, durationSeconds = 1.75, particleRadius = 3.5, shape = 'circle') {
        const safeX = RendererGuards.normalizeNonNegativeNumber(x, 0);
        const safeY = RendererGuards.normalizeNonNegativeNumber(y, 0);
        const safeStartRadius = RendererGuards.normalizeNonNegativeNumber(startRadius, 0);
        const safeEndRadius = RendererGuards.normalizePositiveNumber(endRadius, 24);
        const safeDuration = RendererGuards.normalizePositiveNumber(durationSeconds, 1.75);
        const safeParticleRadius = RendererGuards.normalizePositiveNumber(particleRadius, 3.5);
        const particleCount = Math.max(16, Math.round(safeEndRadius / 2));

        const explosion = new ParticleExplosion(
            safeX,
            safeY,
            safeStartRadius,
            safeEndRadius,
            safeDuration,
            particleCount,
            safeParticleRadius
        );

        if (shape === 'square') {
            explosion.setShapeSquare();
        }

        this.explosions.push(explosion);
    }

    updateExplosions(deltaTime) {
        this.explosions = this.explosions.filter((explosion) => {
            if (!explosion || explosion.isDone) {
                if (explosion) {
                    explosion.destroy();
                }
                return false;
            }

            if (explosion.update(deltaTime)) {
                explosion.destroy();
                return false;
            }
            return true;
        });
    }

    drawExplosions() {
        this.explosions.forEach((explosion) => {
            explosion.draw();
        });
    }

    spawnWave() {
        particleSampleUi.wave.forEach((explosion) => {
            this.createParticleExplosion(
                explosion.x,
                explosion.y,
                explosion.startRadius,
                explosion.endRadius,
                explosion.durationSeconds,
                explosion.particleRadius,
                explosion.shape
            );
        });
    }

    drawStage() {
        const { panelX, panelY, panelWidth, panelHeight, panelBorderSize, panelColor, panelBorderColor, panelBackdrop } = particleSampleUi.theme;
        PrimitiveRenderer.drawRect(panelX - 18, panelY - 18, panelWidth + 36, panelHeight + 36, panelBackdrop);
        PrimitiveRenderer.drawRect(panelX, panelY, panelWidth, panelHeight, panelColor);
        PrimitiveRenderer.drawBounds(panelX, panelY, panelWidth, panelHeight, panelBorderColor, panelBorderSize);
        PrimitiveRenderer.drawLine(panelX, panelY + 84, panelX + panelWidth, panelY + 84, panelBorderColor, 2);
    }

    drawCanvasHeader() {
        const { title, subtitle, help, titleY, subtitleY, helpY, colors } = particleSampleUi.canvasText;
        CanvasText.renderCenteredText(CanvasUtils.ctx, title, titleY, {
            defaultCenterX: canvasConfig.width / 2,
            fontSize: 34,
            fontFamily: uiFont.display,
            color: colors.textPrimary
        });
        CanvasText.renderCenteredText(CanvasUtils.ctx, subtitle, subtitleY, {
            defaultCenterX: canvasConfig.width / 2,
            fontSize: 20,
            fontFamily: uiFont.ui,
            color: colors.textSecondary
        });
        CanvasText.renderCenteredText(CanvasUtils.ctx, help, helpY, {
            defaultCenterX: canvasConfig.width / 2,
            fontSize: 17,
            fontFamily: uiFont.ui,
            color: colors.muted
        });
    }

    gameLoop(deltaTime) {
        this.updateExplosions(deltaTime);

        const currentTimeMs = Date.now();
        if (currentTimeMs - this.lastExplosionTimeMs > particleSampleConfig.explosionIntervalMs) {
            this.spawnWave();
            this.lastExplosionTimeMs = currentTimeMs;
        }

        this.drawStage();
        this.drawCanvasHeader();
        this.drawExplosions();
    }

    onDestroy() {
        this.explosions.forEach((explosion) => {
            if (explosion && !explosion.isDone) {
                explosion.destroy();
            }
        });
        this.explosions = [];
        this.lastExplosionTimeMs = 0;
    }
}

export default Game;

const game = new Game();


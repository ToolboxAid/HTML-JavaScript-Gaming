// ToolboxAid.com
// David Quesenberry
// 03/12/2026
// hud.js

import CanvasUtils from '../../../engine/core/canvasUtils.js';

class AsteroidsHud {
    static FLASH_INTERVAL = 200;
    static FLASH_DURATION = 3000;

    static SCORE_POSITIONS = {
        LIVES: { x: 200, y: 30 },
        SCORE: { x: 200, y: 70 }
    };

    static createFlashState() {
        return {
            startTime: null,
            flashOff: false
        };
    }

    static resetFlashState(flashState) {
        if (!flashState) {
            return;
        }

        flashState.startTime = null;
        flashState.flashOff = false;
    }

    static updateFlashState(flashState, debug = false) {
        if (!flashState) {
            return true;
        }

        if (!flashState.startTime) {
            flashState.startTime = Date.now();
            flashState.flashOff = false;

            if (debug) {
                console.log('Flash Started:', { startTime: flashState.startTime });
            }
        }

        const elapsedTime = Date.now() - flashState.startTime;
        flashState.flashOff = Math.floor(elapsedTime / AsteroidsHud.FLASH_INTERVAL) % 2 === 0;

        if (elapsedTime < AsteroidsHud.FLASH_DURATION) {
            return false;
        }

        if (debug) {
            console.log('Flash Complete');
        }

        AsteroidsHud.resetFlashState(flashState);
        return true;
    }

    static drawShipLives(offsetX, offsetY, vectorMap, lineWidth = 1.25) {
        try {
            CanvasUtils.ctx.beginPath();
            CanvasUtils.ctx.strokeStyle = 'white';
            CanvasUtils.ctx.lineWidth = lineWidth;

            vectorMap.forEach(([rx, ry], index) => {
                if (index === 0) {
                    CanvasUtils.ctx.moveTo(rx + offsetX, ry + offsetY);
                } else {
                    CanvasUtils.ctx.lineTo(rx + offsetX, ry + offsetY);
                }
            });

            CanvasUtils.ctx.closePath();
            CanvasUtils.ctx.stroke();
        } catch (error) {
            console.error('Error occurred while drawing HUD ship lives:', error.message);
        }
    }

    static draw(session, highScore, flashOff = false, debug = false) {
        if (!session) {
            return;
        }

        const { LIVES, SCORE } = AsteroidsHud.SCORE_POSITIONS;
        const ctx = CanvasUtils.ctx;
        const livesVectorMap = session.getLivesVectorMap();

        ctx.fillStyle = 'white';
        ctx.textAlign = 'left';

        session.forEachPlayer((player) => {
            ctx.font = '20px "Vector Battle"';

            if (session.isCurrentPlayer(player) && flashOff) {
                return;
            }

            const xOffset = player * 460;

            ctx.fillText(
                `${session.getScore(player)}`,
                SCORE.x + xOffset,
                SCORE.y
            );

            const shipSpacing = 20;
            for (let life = 0; life < session.getLives(player); life++) {
                const lifeOffset = life * shipSpacing;
                AsteroidsHud.drawShipLives(
                    LIVES.x + xOffset + lifeOffset,
                    LIVES.y,
                    livesVectorMap
                );
            }

            if (debug) {
                console.log(`Drawing P${player + 1}:`, {
                    lives: session.getLives(player),
                    score: session.getScore(player),
                    isCurrentPlayer: session.isCurrentPlayer(player),
                    flashOff
                });
            }
        });

        ctx.font = '15px "Vector Battle"';
        ctx.fillText(`${highScore}`, SCORE.x + 200, SCORE.y);
    }
}

export default AsteroidsHud;



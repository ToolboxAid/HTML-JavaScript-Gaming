// ToolboxAid.com
// David Quesenberry
// 03/12/2026
// hud.js

import CanvasText from '../../../engine/core/canvasText.js';
import PrimitiveRenderer from '../../../engine/renderers/primitiveRenderer.js';

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
            PrimitiveRenderer.drawPath(vectorMap, 'white', lineWidth, {
                offsetX,
                offsetY,
                closePath: true
            });
        } catch (error) {
            console.error('Error occurred while drawing HUD ship lives:', error.message);
        }
    }

    static draw(session, highScore, flashOff = false, debug = false) {
        if (!session) {
            return;
        }

        const { LIVES, SCORE } = AsteroidsHud.SCORE_POSITIONS;
        const livesVectorMap = session.getLivesVectorMap();

        session.forEachPlayer((player) => {
            if (session.isCurrentPlayer(player) && flashOff) {
                return;
            }

            const xOffset = player * 460;

            CanvasText.renderText(`${session.getScore(player)}`, SCORE.x + xOffset, SCORE.y, {
                fontSize: 20,
                fontFamily: '"Vector Battle"',
                color: 'white',
                useDpr: false
            });

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

        CanvasText.renderText(`${highScore}`, SCORE.x + 200, SCORE.y, {
            fontSize: 15,
            fontFamily: '"Vector Battle"',
            color: 'white',
            useDpr: false
        });
    }
}

export default AsteroidsHud;



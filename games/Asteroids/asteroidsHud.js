// ToolboxAid.com
// David Quesenberry
// 03/12/2026
// asteroidsHud.js

import CanvasUtils from '../../engine/canvas.js';

class AsteroidsHud {
    static SCORE_POSITIONS = {
        LIVES: { x: 200, y: 30 },
        SCORE: { x: 200, y: 70 }
    };

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

    static draw(session, highScore, flashOff, debug = false) {
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

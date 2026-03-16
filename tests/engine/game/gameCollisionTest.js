// ToolboxAid.com
// David Quesenberry
// 03/13/2026
// gameCollisionTest.js

import CanvasUtils from '../../../engine/core/canvasUtils.js';
import GameCollision from '../../../engine/game/gameCollision.js';
import GameObjectSystem from '../../../engine/game/gameObjectSystem.js';

export function testGameCollision(assert) {
    const previousConfig = { ...CanvasUtils.config };

    try {
        CanvasUtils.config = {
            ...CanvasUtils.config,
            width: 100,
            height: 100
        };

        const a = { x: 10, y: 10, width: 10, height: 10 };
        const b = { x: 15, y: 15, width: 10, height: 10 };
        const c = { x: 50, y: 50, width: 10, height: 10 };

        assert(GameCollision.intersects(a, b) === true, 'GameCollision.intersects should detect overlap');
        assert(GameCollision.intersects(a, c) === false, 'GameCollision.intersects should detect separation');

        const out = { x: 96, y: 10, width: 10, height: 10 };
        const outSides = GameCollision.getOutOfBoundsSides(out);
        assert(Array.isArray(outSides) && outSides.includes('right'), 'GameCollision.getOutOfBoundsSides should include right');

        const system = new GameObjectSystem(false);
        assert(system.collision === GameCollision, 'GameObjectSystem should expose canonical collision API');
        assert(system.intersects(a, b) === true, 'GameObjectSystem.intersects should delegate to canonical collision API');
        assert(system.isOutOfBounds(out) === true, 'GameObjectSystem.isOutOfBounds should delegate to canonical collision API');
    } finally {
        CanvasUtils.config = previousConfig;
    }
}


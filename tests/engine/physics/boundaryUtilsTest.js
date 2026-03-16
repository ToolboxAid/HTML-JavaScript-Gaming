// ToolboxAid.com
// David Quesenberry
// 03/12/2026
// boundaryUtilsTest.js

import BoundaryUtils from '../../../engine/physics/boundaryUtils.js';
import CanvasUtils from '../../../engine/core/canvasUtils.js';

export function testBoundaryUtils(assert) {
    const originalConfig = CanvasUtils.config;
    CanvasUtils.config = {
        width: 300,
        height: 200,
        scale: 1,
        backgroundColor: '#222222',
        borderColor: 'red',
        borderSize: 15
    };

    try {
        const offLeftObject = {
            x: -20,
            y: 50,
            width: 20,
            height: 20,
            velocityX: -1,
            velocityY: 0
        };

        assert(BoundaryUtils.isCompletelyOffScreen(offLeftObject), 'isCompletelyOffScreen should detect a fully off-screen object');
        assert(BoundaryUtils.getCompletelyOffScreenSides(offLeftObject).includes('left'), 'getCompletelyOffScreenSides should report left');

        const wrappedObject = {
            x: -20,
            y: 50,
            width: 20,
            height: 20,
            velocityX: -1,
            velocityY: 0
        };

        const wrapped = BoundaryUtils.applyWrapAround(wrappedObject);
        assert(wrapped, 'applyWrapAround should report when it wrapped');
        assert(wrappedObject.x >= 300, 'applyWrapAround should move left-exit objects to the right side');

        const insideObject = { x: 200, y: 50, width: 50, height: 50 };
        assert(!BoundaryUtils.checkGameAtBounds(insideObject), 'checkGameAtBounds should allow in-bounds objects');

        const outOfBoundsObject = { x: 275, y: 125, width: 50, height: 50 };
        const hits = BoundaryUtils.checkGameAtBoundsSides(outOfBoundsObject);
        assert(hits.includes('right') || hits.includes('bottom'), 'checkGameAtBoundsSides should report boundary hits');

        const offRightTopLeftObject = {
            x: 301,
            y: 50,
            width: 20,
            height: 20,
            velocityX: 1,
            velocityY: 0
        };
        assert(BoundaryUtils.isCompletelyOffScreen(offRightTopLeftObject), 'isCompletelyOffScreen should detect a top-left object fully off the right side');
        assert(BoundaryUtils.getCompletelyOffScreenSides(offRightTopLeftObject).includes('right'), 'getCompletelyOffScreenSides should report right for top-left objects');

        const xVelocityObject = {
            x: -25,
            y: 40,
            width: 20,
            height: 20,
            xVelocity: -2,
            yVelocity: 0
        };
        assert(BoundaryUtils.isCompletelyOffScreen(xVelocityObject), 'isCompletelyOffScreen should support xVelocity/yVelocity objects');
        assert(BoundaryUtils.getCompletelyOffScreenSides(xVelocityObject).includes('left'), 'getCompletelyOffScreenSides should support xVelocity/yVelocity objects');

        const circleObject = { x: 299, y: 100, radius: 5 };
        assert(BoundaryUtils.checkGameAtBoundsCircle(circleObject), 'checkGameAtBoundsCircle should detect circle bounds');
        assert(BoundaryUtils.checkGameAtBoundsCircleSides(circleObject).includes('right'), 'checkGameAtBoundsCircleSides should report right');
    } finally {
        CanvasUtils.config = originalConfig;
    }
}



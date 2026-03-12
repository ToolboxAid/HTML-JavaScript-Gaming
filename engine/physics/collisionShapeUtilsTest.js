// ToolboxAid.com
// David Quesenberry
// 03/12/2026
// collisionShapeUtilsTest.js

import CollisionShapeUtils from './collisionShapeUtils.js';

export function testCollisionShapeUtils(assert) {
    const vectorObject = {
        x: 10,
        y: 20,
        width: 5,
        height: 6,
        boundX: 8,
        boundY: 19,
        boundWidth: 7,
        boundHeight: 8,
        vectorMap: [[0, 0], [1, 0], [1, 1]],
        rotatedPoints: [[8, 19], [15, 19], [15, 27]],
        rotationAngle: 15
    };

    const vectorShape = CollisionShapeUtils.getVectorShape(vectorObject);
    assert(vectorShape !== null, 'getVectorShape should return shape data');
    assert(vectorShape.bounds.x === 8 && vectorShape.bounds.y === 19, 'getVectorShape should prefer vector bounds');

    const spriteObject = {
        x: 30,
        y: 40,
        boundWidth: 48,
        boundHeight: 32
    };

    const spriteBounds = CollisionShapeUtils.getSpriteBounds(spriteObject);
    assert(spriteBounds.width === 48 && spriteBounds.height === 32, 'getSpriteBounds should use scaled sprite bounds');

    const boxObject = {
        x: 5,
        y: 6,
        width: 10,
        height: 12
    };

    const boxBounds = CollisionShapeUtils.getBoundingBox(boxObject);
    assert(boxBounds.x === 5 && boxBounds.height === 12, 'getBoundingBox should fall back to width/height');
}

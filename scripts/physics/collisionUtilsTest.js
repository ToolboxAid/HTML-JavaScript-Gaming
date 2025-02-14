// ToolboxAid.com
// David Quesenberry
// 02/14/2025
// collisionUtilsTest.js


import CollisionUtils from "./collisionUtils.js";
import CanvasUtils from "../canvas.js";

export function testCollisionUtils(assert) {

    // Test: isPointInsidePolygon
    const polygon = [
        [0, 0],
        [4, 0],
        [4, 4],
        [0, 4]
    ];

    const pointInside = { x: 2, y: 2 };
    const pointOutside = { x: 5, y: 5 };

    assert(CollisionUtils.isPointInsidePolygon(pointInside.x, pointInside.y, polygon), "Point should be inside the polygon");
    assert(!CollisionUtils.isPointInsidePolygon(pointOutside.x, pointOutside.y, polygon), "Point should be outside the polygon");

    // Test: arePolygonsOverlapping
    const polygon1 = [
        [0, 0],
        [4, 0],
        [4, 4],
        [0, 4]
    ];

    const polygon2 = [
        [2, 2],
        [6, 2],
        [6, 6],
        [2, 6]
    ];

    const polygon3 = [
        [5, 5],
        [9, 5],
        [9, 9],
        [5, 9]
    ];

    assert(CollisionUtils.arePolygonsOverlapping(polygon1, polygon2), "Polygons should overlap");
    assert(!CollisionUtils.arePolygonsOverlapping(polygon1, polygon3), "Polygons should NOT overlap");

    // Test: isContainedWithin
    const objectA = { x: 1, y: 1, width: 2, height: 2 };
    const container = { x: 0, y: 0, width: 4, height: 4 };

    const objectB = { x: 4, y: 4, width: 2, height: 2 };

    assert(CollisionUtils.isContainedWithin(objectA, container), "Object A should be contained within the container");
    assert(!CollisionUtils.isContainedWithin(objectB, container), "Object B should not be contained within the container");

    // Test: isCollidingWith
    const object1 = { x: 1, y: 1, width: 2, height: 2 };
    const object2 = { x: 2, y: 2, width: 2, height: 2 };
    const object3 = { x: 5, y: 5, width: 2, height: 2 };

    assert(CollisionUtils.isCollidingWith(object1, object2), "Objects should collide");
    assert(!CollisionUtils.isCollidingWith(object1, object3), "Objects should not collide");

    // Test: isCollidingWithSides (Check for side collision)
    const collisions = CollisionUtils.isCollidingWithSides(object1, object2);
    assert(collisions.includes('right'), "Should detect a right-side collision");

    const noCollisions = CollisionUtils.isCollidingWithSides(object1, object3);
    assert(noCollisions.length === 0, "Should not detect any collision sides");


    // Initialize CanvasUtils
    const config = {
        width: 1024,
        height: 768,
        scale: 1.0,
        backgroundColor: "#222222",
        borderColor: "red",
        borderSize: 15,
    };
    CanvasUtils.init(config);  // Use static method directly

    console.log("Config Width x Height:",CanvasUtils.getConfigWidth(), CanvasUtils.getConfigHeight());
    console.log("Canvas Width x Height:",CanvasUtils.getCanvasWidth(), CanvasUtils.getCanvasHeight());

    // Test: checkGameBounds (Test with object near bounds)
    const objectNearBounds = { x: 200, y: 50, width: 50, height: 50 }; // Assuming canvas size of 500x500
    assert(!CollisionUtils.checkGameBounds(objectNearBounds), "Object should in game bounds");

    // Test: checkGameBoundsSides (Test if boundary sides are hit)
    const objectFarBounds = { x: 275, y: 125, width: 50, height: 50 }; // Assuming canvas size of 500x500
    const boundaryHits = CollisionUtils.checkGameBoundsSides(objectFarBounds);
    assert(boundaryHits.length > 0, "Should detect boundaries hit");
}


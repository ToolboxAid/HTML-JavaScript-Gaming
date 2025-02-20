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

    // Test: vectorCollisionDetection
    const objectA = {
        x: 10,
        y: 10,
        rotationAngle: 0,
        vectorMap: [
            [0, 0],
            [4, 0],
            [4, 4],
            [0, 4]
        ],
        radius: 2.83 // Approximate radius for a 4x4 square (diagonal distance)
    };

    const objectB = {
        x: 12,
        y: 12,
        rotationAngle: 0,
        vectorMap: [
            [0, 0],
            [4, 0],
            [4, 4],
            [0, 4]
        ],
        radius: 2.83
    };

    const objectC = {
        x: 15,
        y: 15,
        rotationAngle: 0,
        vectorMap: [
            [0, 0],
            [4, 0],
            [4, 4],
            [0, 4]
        ],
        radius: 2.83
    };

    // Test overlapping objects
    assert(CollisionUtils.vectorCollisionDetection(objectA, objectB), "Objects A and B should collide (overlapping)");

    // Test non-overlapping objects
    assert(!CollisionUtils.vectorCollisionDetection(objectA, objectC), "Objects A and C should not collide (non-overlapping)");

    // Test rotated objects (45 degrees)
    const objectD = {
        x: 0,
        y: 0,
        rotationAngle: 45,
        vectorMap: [
            [0, 0],
            [4, 0],
            [4, 4],
            [0, 4]
        ],
        radius: 2.83 // Approximate radius for a 4x4 square (diagonal distance)
    };
    
    const objectE = {
        x: 3,
        y: 3,
        rotationAngle: 45,
        vectorMap: [
            [0, 0],
            [5, 0],
            [5, 5],
            [0, 5]
        ],
        radius: 3.54
    };
    
    assert(CollisionUtils.vectorCollisionDetection(objectD, objectE), "Objects D and E should collide (rotated and overlapping)");

    // Test edge case: objects touching but not overlapping
    const objectF = {
        x: 4,
        y: 0,
        rotationAngle: 0,
        vectorMap: [
            [0, 0],
            [4, 0],
            [4, 4],
            [0, 4]
        ],
        radius: 2.83
    };

    assert(!CollisionUtils.vectorCollisionDetection(objectA, objectF), "Objects A and F should not collide (touching edges)");


    // Test: isContainedWithin
    const objectG = { x: 1, y: 1, width: 2, height: 2 };
    const container = { x: 0, y: 0, width: 4, height: 4 };

    const objectH = { x: 4, y: 4, width: 2, height: 2 };

    assert(CollisionUtils.isContainedWithin(objectG, container), "Object A should be contained within the container");
    assert(!CollisionUtils.isContainedWithin(objectH, container), "Object B should not be contained within the container");

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
        width: 300,
        height: 200,
        scale: 1.0,
        backgroundColor: "#222222",
        borderColor: "red",
        borderSize: 15,
    };
    CanvasUtils.init(config);  // Use static method directly

    //console.log("Canvas Width x Height:",CanvasUtils.getConfigWidth(), CanvasUtils.getConfigHeight());

    // Test: checkGameAtBounds (Test with object near bounds)
    const objectNearBounds = { x: 200, y: 50, width: 50, height: 50 }; // Assuming canvas size of 500x500
    assert(!CollisionUtils.checkGameAtBounds(objectNearBounds), "Object should be in game bounds");

    // Test: checkGameAtBoundsSides (Test if boundary sides are hit)
    const objectFarBounds = { x: 275, y: 125, width: 50, height: 50 }; // Assuming canvas size of 500x500
    const boundaryHits = CollisionUtils.checkGameAtBoundsSides(objectFarBounds);
    assert(boundaryHits.length > 0, "Should detect boundaries hit");
}


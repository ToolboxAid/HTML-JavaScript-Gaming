// ToolboxAid.com
// David Quesenberry
// 02/14/2025
// collisionUtilsTest.js


import CollisionUtils from "../../../engine/physics/collisionUtils.js";
import BoundaryUtils from "../../../engine/physics/boundaryUtils.js";
import CollisionShapeUtils from "../../../engine/physics/collisionShapeUtils.js";
import VectorShapeUtils from "../../../engine/physics/vectorShapeUtils.js";
import CanvasUtils from "../../../engine/core/canvasUtils.js";

export function testCollisionUtils(assert) {
    const originalConfig = CanvasUtils.config;

    function createVectorObject(x, y, vectorMap, rotationAngle = 0) {
        const transformedShape = VectorShapeUtils.calculateTransformedShape(vectorMap, x, y, rotationAngle);

        return {
            x,
            y,
            rotationAngle,
            vectorMap,
            rotatedPoints: transformedShape.rotatedPoints,
            boundX: transformedShape.bounds.x,
            boundY: transformedShape.bounds.y,
            boundWidth: transformedShape.bounds.width,
            boundHeight: transformedShape.bounds.height
        };
    }

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
    assert(CollisionUtils.pointInPolygon(pointInside.x, pointInside.y, polygon), "pointInPolygon alias should be inside the polygon");

    // Test: vectorCollisionDetection
    const square4 = [
        [0, 0],
        [4, 0],
        [4, 4],
        [0, 4]
    ];
    const square5 = [
        [0, 0],
        [5, 0],
        [5, 5],
        [0, 5]
    ];

    const objectA = createVectorObject(10, 10, square4, 0);
    const objectB = createVectorObject(12, 12, square4, 0);
    const objectC = createVectorObject(15, 15, square4, 0);

    // Test overlapping objects
    assert(CollisionUtils.vectorCollisionDetection(objectA, objectB), "Objects A and B should collide (overlapping)");
    assert(CollisionUtils.vectorIntersectsVector(objectA, objectB), "vectorIntersectsVector should detect vector overlap");

    // Test non-overlapping objects
    assert(!CollisionUtils.vectorCollisionDetection(objectA, objectC), "Objects A and C should not collide (non-overlapping)");

    // Test rotated objects (45 degrees)
    const objectD = createVectorObject(0, 0, square4, 45);
    const objectE = createVectorObject(3, 3, square5, 45);
    
    assert(CollisionUtils.vectorCollisionDetection(objectD, objectE), "Objects D and E should collide (rotated and overlapping)");

    // Test edge case: objects touching but not overlapping
    const objectF = createVectorObject(4, 0, square4, 0);

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
    assert(CollisionUtils.boxIntersectsBox(object1, object2), "boxIntersectsBox should detect overlap");
    assert(CollisionUtils.spriteBoundsIntersect(object1, object2), "spriteBoundsIntersect should detect overlap");
    assert(CollisionUtils.pointInBox(2, 2, object1), "pointInBox should detect a point inside the box");
    assert(!CollisionUtils.pointInBox(10, 10, object1), "pointInBox should reject a point outside the box");

    // Test: isCollidingWithSides (Check for side collision)
    const collisions = CollisionUtils.isCollidingWithSides(object1, object2);
    assert(collisions.includes('right'), "Should detect a right-side collision");

    const noCollisions = CollisionUtils.isCollidingWithSides(object1, object3);
    assert(noCollisions.length === 0, "Should not detect any collision sides");

    const scaledSprite1 = { x: 10, y: 10, width: 16, height: 16, boundWidth: 32, boundHeight: 32 };
    const scaledSprite2 = { x: 35, y: 10, width: 16, height: 16, boundWidth: 32, boundHeight: 32 };
    assert(CollisionUtils.spriteBoundsIntersect(scaledSprite1, scaledSprite2), "spriteBoundsIntersect should use scaled bounds");

    const vectorBoundsObject = {
        x: 10,
        y: 10,
        width: 4,
        height: 4,
        boundX: 8,
        boundY: 8,
        boundWidth: 8,
        boundHeight: 8
    };
    const extractedBounds = CollisionShapeUtils.getBoundingBox(vectorBoundsObject);
    assert(extractedBounds.x === 8 && extractedBounds.width === 8, "CollisionShapeUtils should prefer explicit vector bounds");


    // Provide game bounds without requiring DOM canvas initialization.
    CanvasUtils.config = {
        width: 300,
        height: 200,
        scale: 1.0,
        backgroundColor: "#222222",
        borderColor: "red",
        borderSize: 15,
    };

    try {
        // Test: checkGameAtBounds (Test with object near bounds)
        const objectNearBounds = { x: 200, y: 50, width: 50, height: 50 };
        assert(!CollisionUtils.checkGameAtBounds(objectNearBounds), "Object should be in game bounds");

        // Test: checkGameAtBoundsSides (Test if boundary sides are hit)
        const objectFarBounds = { x: 275, y: 125, width: 50, height: 50 };
        const boundaryHits = CollisionUtils.checkGameAtBoundsSides(objectFarBounds);
        assert(boundaryHits.length > 0, "Should detect boundaries hit");
        assert(BoundaryUtils.checkGameAtBounds(objectFarBounds), "BoundaryUtils should detect bounds hit");
    } finally {
        CanvasUtils.config = originalConfig;
    }
}




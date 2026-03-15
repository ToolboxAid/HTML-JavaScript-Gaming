import VectorShapeUtils from '../../../engine/physics/vectorShapeUtils.js';

export function testVectorShapeUtils(assert) {
    const vectorMap = [
        [-2, -1],
        [2, -1],
        [2, 1],
        [-2, 1]
    ];

    const initialBounds = VectorShapeUtils.calculateInitialBounds(vectorMap);
    assert(initialBounds.width === 4, 'calculateInitialBounds width failed');
    assert(initialBounds.height === 2, 'calculateInitialBounds height failed');

    const center = VectorShapeUtils.getCenterPoint(vectorMap);
    assert(center.x === 0, 'getCenterPoint x failed');
    assert(center.y === 0, 'getCenterPoint y failed');

    const rotatedPoints = VectorShapeUtils.getRotatedPoints(vectorMap, 10, 20, 0);
    assert(rotatedPoints.length === 4, 'getRotatedPoints length failed');
    assert(rotatedPoints[0][0] === 8 && rotatedPoints[0][1] === 19, 'getRotatedPoints translation failed');

    const transformedShape = VectorShapeUtils.calculateTransformedShape(vectorMap, 10, 20, 0);
    assert(transformedShape.rotatedPoints.length === 4, 'calculateTransformedShape points failed');
    assert(transformedShape.bounds.x === 8, 'calculateTransformedShape bounds x failed');
    assert(transformedShape.bounds.y === 19, 'calculateTransformedShape bounds y failed');
    assert(transformedShape.bounds.width === 4, 'calculateTransformedShape bounds width failed');
    assert(transformedShape.bounds.height === 2, 'calculateTransformedShape bounds height failed');

    const rotatedShape = VectorShapeUtils.calculateTransformedShape(vectorMap, 0, 0, 90);
    assert(rotatedShape.rotatedPoints.length === 4, 'rotated shape points failed');
    assert(rotatedShape.bounds.width === 3, 'rotated shape bounds width failed');
    assert(rotatedShape.bounds.height === 4, 'rotated shape bounds height failed');
}

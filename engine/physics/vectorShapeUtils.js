import AngleUtils from '../math/angleUtils.js';
import ObjectValidation from '../utils/objectValidation.js';

class VectorShapeUtils {
    constructor() {
        throw new Error('VectorShapeUtils is a utility class with only static methods. Do not instantiate.');
    }

    static calculateInitialBounds(vectorMap) {
        ObjectValidation.pointArray(vectorMap, 'vectorMap');

        const xs = vectorMap.map(([x]) => x);
        const ys = vectorMap.map(([, y]) => y);

        return {
            width: Math.max(...xs) - Math.min(...xs),
            height: Math.max(...ys) - Math.min(...ys)
        };
    }

    static getCenterPoint(vectorMap) {
        ObjectValidation.pointArray(vectorMap, 'vectorMap');

        return {
            x: vectorMap.reduce((sum, [vx]) => sum + vx, 0) / vectorMap.length,
            y: vectorMap.reduce((sum, [, vy]) => sum + vy, 0) / vectorMap.length
        };
    }

    static getRotatedPoints(vectorMap, x = 0, y = 0, rotationAngle = 0) {
        ObjectValidation.pointArray(vectorMap, 'vectorMap');
        ObjectValidation.finiteNumber(x, 'x');
        ObjectValidation.finiteNumber(y, 'y');
        ObjectValidation.finiteNumber(rotationAngle, 'rotationAngle');

        const center = this.getCenterPoint(vectorMap);

        return vectorMap.map(([vx, vy]) => {
            const dx = vx - center.x;
            const dy = vy - center.y;
            const rotatedPoint = AngleUtils.applyRotationToPoint(dx, dy, rotationAngle);

            return [
                rotatedPoint.rotatedX + x,
                rotatedPoint.rotatedY + y
            ];
        });
    }

    static calculateBoundsFromPoints(points) {
        ObjectValidation.pointArray(points, 'points');

        let minX = Infinity;
        let maxX = -Infinity;
        let minY = Infinity;
        let maxY = -Infinity;

        for (const [x, y] of points) {
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
        }

        return {
            x: Math.floor(minX),
            y: Math.floor(minY),
            width: Math.max(1, Math.ceil(maxX - minX)),
            height: Math.max(1, Math.ceil(maxY - minY))
        };
    }

    static calculateTransformedShape(vectorMap, x = 0, y = 0, rotationAngle = 0) {
        const rotatedPoints = this.getRotatedPoints(vectorMap, x, y, rotationAngle);
        const bounds = this.calculateBoundsFromPoints(rotatedPoints);

        return {
            rotatedPoints,
            bounds
        };
    }
}

export default VectorShapeUtils;

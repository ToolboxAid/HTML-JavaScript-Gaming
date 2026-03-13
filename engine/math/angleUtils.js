// ToolboxAid.com
// David Quesenberry
// 02/12/2025
// angleUtils.js

class AngleUtils {

    static DEG_TO_RAD = Math.PI / 180;
    static RAD_TO_DEG = 180 / Math.PI;

    /** Constructor for AngleUtils class.
     * @throws {Error} Always throws error as this is a utility class with only static methods.
     * @example
     * ❌ Don't do this:
     * const angleUtils = new AngleUtils(); // Throws Error
     * 
     * ✅ Do this:
     * AngleUtils.toDegrees(...); // Use static methods directly
     */
    constructor() {
        throw new Error('AngleUtils is a utility class with only static methods. Do not instantiate.');
    }

    // Convert radians to degrees
    static toDegrees(radians) {
        return radians * this.RAD_TO_DEG;
    }

    // Convert degrees to radians
    static toRadians(degrees) {
        return degrees * this.DEG_TO_RAD;
    }

    // Normalize an angle to be within 0-360 degrees
    static normalizeAngle(angle) {
        return ((angle % 360) + 360) % 360; // Ensures angle is within [0, 360)
    }

    // Apply rotation to an object
    static applyRotation(object, deltaTime, direction) {
        object.rotationAngle += (object.rotationSpeed * direction) * deltaTime;
    }

    // Apply rotation to a point around origin
    static applyRotationToPoint(x, y, rotationAngle) {
        const radians = (rotationAngle * Math.PI) / 180;
        return {
            rotatedX: x * Math.cos(radians) - y * Math.sin(radians),
            rotatedY: x * Math.sin(radians) + y * Math.cos(radians)
        };
    }

    // Convert an angle in degrees to a direction vector
    static angleToVector(angle) {
        const radians = angle * this.DEG_TO_RAD;
        return { x: Math.cos(radians), y: Math.sin(radians) };
    }

    // Convert velocity components (x, y) to an angle in degrees
    static velocityToAngle(xVelocity, yVelocity) {
        const angleInRadians = Math.atan2(yVelocity, xVelocity);
        return this.normalizeAngle(angleInRadians * this.RAD_TO_DEG);
    }
    // Convert an angle in degrees to velocity components (x, y)
    static angleToVelocity(angle, precision = 4) {
        const radians = angle * this.DEG_TO_RAD;
        return {
            x: parseFloat(Math.cos(radians).toFixed(precision)),
            y: parseFloat(Math.sin(radians).toFixed(precision))
        };
    }

    // Calculates the angle in degrees from source object to target object
    static getAngleBetweenObjects(source, target) {
        // Calculate direction vector
        const dx = target.x - source.x;
        const dy = target.y - source.y;

        // Calculate angle in radians using atan2
        const angleRadians = Math.atan2(dy, dx);

        // Convert to degrees and normalize to 0-360
        return this.normalizeAngle(angleRadians * this.RAD_TO_DEG);
    }

    static getSlope(point1, point2) {
        if (point2.x - point1.x === 0) {
            return Infinity; // Avoid division by zero (vertical line)
        }
        return (point2.y - point1.y) / (point2.x - point1.x);
    }
    
    static calculateOrbitalPosition(centerX, centerY, angle, distance) {
        const radian = this.toRadians(angle);
        return {
            x: centerX + distance * Math.cos(radian),
            y: centerY + distance * Math.sin(radian)
        };
    }
    // Calculate the position of an object in a circular orbit
    static getOrbitalPosition(centerX, centerY, angle, radius) {
        const radians = angle * this.DEG_TO_RAD;
        return {
            x: centerX + radius * Math.cos(radians),
            y: centerY + radius * Math.sin(radians)
        };
    }

}

export default AngleUtils;

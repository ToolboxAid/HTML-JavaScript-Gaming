
// ToolboxAid.com
// David Quesenberry
// 02/12/2025
// angleUtils.js

class AngleUtils {

    static DEG_TO_RAD = Math.PI / 180;
    static RAD_TO_DEG = 180 / Math.PI;

    static toDegrees(radians) {
        return radians * this.RAD_TO_DEG;
    }

    static toRadians(degrees) {
        return degrees * this.DEG_TO_RAD;
    }

    static normalizeAngle(angle) {// Normalize an angle to be within 0-360 degrees
        return ((angle % 360) + 360) % 360; // Ensures angle is within [0, 360)
    }

    static applyRotation(object, deltaTime, direction) {
        object.rotationAngle += (object.rotationSpeed * direction) * deltaTime;
    }

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

    /** Calculates the angle in degrees from source object to target object
     * @param {Object} source - Source object with x,y coordinates
     * @param {Object} target - Target object with x,y coordinates
     * @returns {number} Angle in degrees (0-360)
     */
    static getAngleBetweenObjects(source, target) {
        // Calculate direction vector
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        
        // Calculate angle in radians using atan2
        const angleRadians = Math.atan2(dy, dx);
        
        // Convert to degrees and normalize to 0-360
        return this.normalizeAngle(angleRadians * this.RAD_TO_DEG);
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

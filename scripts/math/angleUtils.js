
class AngleUtils{

    /** Angles */
    static radToDeg(radians) {
        return radians * (180 / Math.PI);
    }

    static degToRad(degrees) {
        return degrees * (Math.PI / 180);
    }

    static degreeLimits(rotationAngle) {// Wrap rotationAngle to keep it between 0 and 360
        return (rotationAngle % 360 + 360) % 360;
    }

    // Applies rotation to the object based on its angular velocity and the elapsed time (deltaTime).
    static applyRotation(object, deltaTime, direction) {
        object.rotationAngle += (object.rotationSpeed * direction) * deltaTime;
    }// Physics.applyRotation(spaceship, spaceship.angularVelocity, deltaTime);

    static getVectorDirection(rotationAngle) {
        // Convert the angle/degree to radians
        const radians = (rotationAngle * Math.PI) / 180;
        return {
            x: Math.cos(radians), // X-component
            y: Math.sin(radians)  // Y-component
        };
    }

    // Apply Rotation (around the origin)
    static applyRotationToPoint(x, y, rotationAngle) {
        // Convert the angle to radians
        const radians = (rotationAngle * Math.PI) / 180;

        // Apply the rotation formula
        const rotatedX = x * Math.cos(radians) - y * Math.sin(radians);
        const rotatedY = x * Math.sin(radians) + y * Math.cos(radians);

        // Return the rotated coordinates
        return { rotatedX, rotatedY };
    }  // const rotatedPoint = Physics.applyRotationToPoint(originalX, originalY, rotationAngle);

    static calculateXY2Angle(xVelocity, yVelocity) {
        const angleInRadians = Math.atan2(yVelocity, xVelocity);
        const angleInDegrees = angleInRadians * (180 / Math.PI);
        return AngleUtils.degreeLimits(angleInDegrees); // Ensure the angle is positive
    }

    static calculateAngle2XY(angle, decimals = 4) {
        const radians = AngleUtils.degToRad(angle); //angle * (Math.PI / 180);
        const x = (Math.cos(radians)).toFixed(decimals);
        const y = (Math.sin(radians)).toFixed(decimals);
        return { x: parseFloat(x), y: parseFloat(y) };
    }

    static calculateOrbitalPosition(centerX, centerY, angle, distance) {
        const radian = this.degToRad(angle);
        const x = centerX + distance * Math.cos(radian);
        const y = centerY + distance * Math.sin(radian);
        return { x: x, y: y };
    }
}

export default AngleUtils;
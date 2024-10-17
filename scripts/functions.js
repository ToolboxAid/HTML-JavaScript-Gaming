// ToolboxAid.com
// David Quesenberry
// functions.js
// 10/16/2024

class Functions {
    static calculateXY2Angle(xVelocity, yVelocity) {
        // Calculate angle in radians
        const angleInRadians = Math.atan2(yVelocity, xVelocity);

        // Convert to degrees
        const angleInDegrees = angleInRadians * (180 / Math.PI);

        // Normalize the angle to be between 0 and 360 degrees
        return (angleInDegrees + 360) % 360; // Ensures the angle is positive
    }

    static calculateAngle2XY(angle, decimals = 4) {
        const radians = angle * (Math.PI / 180);
        const x = (Math.cos(radians)).toFixed(decimals);
        const y = (Math.sin(radians)).toFixed(decimals);

        return { x: parseFloat(x), y: parseFloat(y) };
    }

    static randomGenerator(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;;
    }
}

// Export the Functions class
export default Functions;

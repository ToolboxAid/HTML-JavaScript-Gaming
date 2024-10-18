// ToolboxAid.com
// David Quesenberry
// functions.js
// 10/16/2024

class Functions {
    static calculateXY2Angle(xVelocity, yVelocity) {
        const angleInRadians = Math.atan2(yVelocity, xVelocity);
        const angleInDegrees = angleInRadians * (180 / Math.PI);
        return (angleInDegrees + 360) % 360; // Ensure the angle is positive
    }

    static calculateAngle2XY(angle, decimals = 4) {
        const radians = angle * (Math.PI / 180);
        const x = (Math.cos(radians)).toFixed(decimals);
        const y = (Math.sin(radians)).toFixed(decimals);
        return { x: parseFloat(x), y: parseFloat(y) };
    }

    static randomGenerator(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }  
}

// Export the Functions class
export default Functions;

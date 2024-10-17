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

    static drawLine(ctx, x1, y1, x2, y2, lineWidth = 5, strokeColor = 'white') {
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = strokeColor; // Default to white if no color is provided
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }

    static drawDashLine(ctx, x1, y1, x2, y2, lineWidth, strokeColor = 'white', dashPattern = [10, 10]) {
        ctx.save(); // Save the current context state

        // Set the line properties
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = strokeColor;

        // Set the line dash pattern
        ctx.setLineDash(dashPattern);

        // Draw the dashed line
        ctx.beginPath();
        ctx.moveTo(x1, y1); // Start point
        ctx.lineTo(x2, y2); // End point
        ctx.stroke(); // Render the line
    }    
}

// Export the Functions class
export default Functions;

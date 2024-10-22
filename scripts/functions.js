// ToolboxAid.com
// David Quesenberry
// 10/16/2024
// functions.js

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

    static linesIntersect(line1Start, line1End, line2Start, line2End) {
        const denom = (line1End.x - line1Start.x) * (line2End.y - line2Start.y) -
                      (line1End.y - line1Start.y) * (line2End.x - line2Start.x);

        if (denom === 0) {
            return null; // Lines are parallel
        }

        const ua = ((line2End.x - line2Start.x) * (line1Start.y - line2Start.y) -
                     (line2End.y - line2Start.y) * (line1Start.x - line2Start.x)) / denom;
        const ub = ((line1End.x - line1Start.x) * (line1Start.y - line2Start.y) -
                     (line1End.y - line1Start.y) * (line1Start.x - line2Start.x)) / denom;

        if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
            return null; // Intersection is outside the line segments
        }

        const intersectionPoint = {
            x: line1Start.x + ua * (line1End.x - line1Start.x),
            y: line1Start.y + ua * (line1End.y - line1Start.y)
        };

        return intersectionPoint; // Return the intersection point
    }


    //s/b playFrequency
    static playSound(frequency, duration) {
        // Create a new audio context
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();

        // Create an oscillator
        const oscillator = audioContext.createOscillator();

        // Set the frequency
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

        // Connect the oscillator to the output (speakers)
        oscillator.connect(audioContext.destination);

        // Start the oscillator
        oscillator.start();

        // Stop the oscillator after 1 second
        oscillator.stop(audioContext.currentTime + duration);
    }
}

// Export the Functions class
export default Functions;

// ToolboxAid.com
// David Quesenberry
// 10/16/2024
// functions.js

class Functions {

    static selectNumberOfPlayers(ctx, canvasConfig, playerSelect, keyboardInput) {
        const maxPlayers = playerSelect.maxPlayers || 4;
        const lives = playerSelect.lives || 3;
        const fillText = playerSelect.fillText || "Select Player Mode";
        const x = playerSelect.optionBaseX || 300;
        const y = playerSelect.optionBaseY || 300;
        const spacing = playerSelect.optionSpacing || 50;

        ctx.fillStyle = playerSelect.fillStyle || "white";
        ctx.font = playerSelect.font || "30px Arial";
        ctx.fillText(fillText, x, y);

        for (let i = 1; i <= maxPlayers; i++) {
            ctx.fillText(`Press \`${i}\` for ${i} Player${i > 1 ? "s" : ""}`,
                (canvasConfig.width / 2) - 200, y + i * spacing);
        }

        // Loop through potential player counts
        for (let i = 1; i <= maxPlayers; i++) {
            if (keyboardInput.getkeysPressed().includes(`Digit${i}`)) {
                return { playerCount: i, playerLives: Array.from({ length: maxPlayers }, (_, index) => (index < i ? lives : 0)), gameState: "initGame" };
            }
        }
    }

    static swapPlayer(playerLives, currentPlayer, playerCount, setGameState) {
        // Decrease the current player's life
        playerLives[currentPlayer] -= 1;
        console.log(`Player ${currentPlayer + 1} lost a life!`);

        // Check if the current player is out of lives
        if (playerLives[currentPlayer] <= 0) {
            console.log(`Player ${currentPlayer + 1} is out of lives.`);

            // Check if all players are out of lives
            const allOut = playerLives.every(lives => lives <= 0);
            if (allOut) {
                console.log("All players are out of lives. Game Over!");
                setGameState("gameOver");
                return { updatedPlayer: currentPlayer, updatedLives: playerLives };
            }
        }

        // Find the next player with lives left
        let nextPlayer = currentPlayer;
        do {
            nextPlayer = (nextPlayer + 1) % playerCount; // Cycle to the next player
        } while (playerLives[nextPlayer] <= 0);

        // Set the next player as the current player
        console.log(`Swapping to Player ${nextPlayer + 1}.`);
        return { updatedPlayer: nextPlayer, updatedLives: playerLives };
    }

    static radToDeg(radians) {
        return radians * (180 / Math.PI);
    }

    static degToRad(degrees) {
        return degrees * (Math.PI / 180);
    }

    // Wrap rotationAngle to keep it between 0 and 360
    static degreeLimits(rotationAngle) {
        return (rotationAngle % 360 + 360) % 360;
    }

    static calculateXY2Angle(xVelocity, yVelocity) {
        const angleInRadians = Math.atan2(yVelocity, xVelocity);
        const angleInDegrees = angleInRadians * (180 / Math.PI);
        return (angleInDegrees + 360) % 360; // Ensure the angle is positive
    }

    static calculateAngle2XY(angle, decimals = 4) {
        const radians = Functions.degToRad(angle); //angle * (Math.PI / 180);
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

    static randomBoolean() {
        return Functions.randomGenerator(0, 1, true);
    }

    static randomGenerator(min, max, isInteger = true) {
        const result = Math.random() * (max - min + (isInteger ? 1 : 0)) + min;
        return isInteger ? Math.floor(result) : result;
    }

    static getDistance(startPoint, endPoint, debug = false) {
        const dx = endPoint.x - startPoint.x;
        const dy = endPoint.y - startPoint.y;
        if (debug) console.log('Start Point:', startPoint, 'End Point:', endPoint);
        return Math.sqrt(dx * dx + dy * dy);
    }

    static linesIntersect(line1Start, line1End, line2Start, line2End) {
        if (!line1Start || !line1End || !line2Start || !line2End ||
            !('x' in line1Start && 'y' in line1Start && 'x' in line1End && 'y' in line1End &&
                'x' in line2Start && 'y' in line2Start && 'x' in line2End && 'y' in line2End)) {
            throw new Error('Invalid input: all points must have x and y properties');
        }
        const denom = (line1End.x - line1Start.x) * (line2End.y - line2Start.y) -
            (line1End.y - line1Start.y) * (line2End.x - line2Start.x);
        if (denom === 0) return null;
        const ua = ((line2End.x - line2Start.x) * (line1Start.y - line2Start.y) -
            (line2End.y - line2Start.y) * (line1Start.x - line2Start.x)) / denom;
        const ub = ((line1End.x - line1Start.x) * (line1Start.y - line2Start.y) -
            (line1End.y - line1Start.y) * (line1Start.x - line2Start.x)) / denom;
        if (ua < 0 || ua > 1 || ub < 0 || ub > 1) return null;
        return {
            x: line1Start.x + ua * (line1End.x - line1Start.x),
            y: line1Start.y + ua * (line1End.y - line1Start.y)
        };
    }

    static linesIntersect2(line1Start, line1End, line2Start, line2End) {
        // These are points : line1Start, line1End, line2Start, line2End
        const denom = (line1End.x - line1Start.x) * (line2End.y - line2Start.y) - (line1End.y - line1Start.y) * (line2End.x - line2Start.x);

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
}

// Export the Functions class
export default Functions;

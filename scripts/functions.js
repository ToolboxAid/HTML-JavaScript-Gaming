// ToolboxAid.com
// David Quesenberry
// 10/16/2024
// functions.js

import GameControllers from "./gameControllers.js";

class Functions {

    /**  Player information
    */
    static selectNumberOfPlayers(ctx, canvasConfig, playerSelect, keyboardInput, gameControllers) {
        ctx.fillStyle = canvasConfig.backgroundColor + 'AA'; // Semi-transparent
        ctx.fillRect(0, 0, canvasConfig.width, canvasConfig.height); // Overlay the canvas

        const maxPlayers = playerSelect.maxPlayers || 4;
        const lives = playerSelect.lives || 3;
        const fillText = playerSelect.fillText || "Select Player Mode";
        const x = playerSelect.optionBaseX || 100;
        const y = playerSelect.optionBaseY || 100;
        const spacing = playerSelect.optionSpacing || 50;

        // ---------------------
        // Keyboard Input
        ctx.fillStyle = playerSelect.fillStyle || "white";
        ctx.font = playerSelect.font || "30px Arial";
        ctx.fillText(fillText, x, y);

        for (let i = 1; i <= maxPlayers; i++) {
            ctx.fillText(`Keyboard \`${i}\` for ${i} Player${i > 1 ? "s" : ""}`,
                (canvasConfig.width / 2) - 200, y + i * spacing);
        }
        // Loop through potential player counts
        for (let i = 1; i <= maxPlayers; i++) {
            if (keyboardInput.getkeysPressed().includes(`Digit${i}`) ||
                keyboardInput.getkeysPressed().includes(`Numpad${i}`)) {
                return { playerCount: i, playerLives: Array.from({ length: maxPlayers }, (_, index) => (index < i ? lives : 0)), gameState: "initGame" };
            }
        }

        // ---------------------
        // GameController Input
        ctx.fillText('GameController Select Player(s)', x, y + 150);
        ctx.fillText('`Left Bumper` 1 player', (canvasConfig.width / 2) - 200, y + 200);
        ctx.fillText('`Right Bumper` 2 players', (canvasConfig.width / 2) - 200, y + 250);

        if (gameControllers) {
            console.warn('GameController currently supports 2 players');
            if (gameControllers.isButtonIndexDown(0, 4)) {
                const i = 1;
                return {
                    playerCount: i, playerLives: Array.from({ length: maxPlayers },
                        (_, index) => (index < i ? lives : 0)), gameState: "initGame"
                };
            }
            if (gameControllers.isButtonIndexDown(0, 5)) {
                const i = 2;
                return {
                    playerCount: i, playerLives: Array.from({ length: maxPlayers },
                        (_, index) => (index < i ? lives : 0)), gameState: "initGame"
                };
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
        return Functions.degreeLimits(angleInDegrees); // Ensure the angle is positive
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

    /** Random
     * 
     */
    static randomBoolean() {
        return Functions.randomRange(0, 1, true);
    }

    static randomRange(min, max, isInteger = true) {
        const result = Math.random() * (max - min + (isInteger ? 1 : 0)) + min;
        return isInteger ? Math.floor(result) : result;
    }

    /** Lines and Distanc
     * 
     */
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

    /** Misc
     * 
     */
    static toCamelCase(...args) {
        return args
            .join(' ') // Concatenate all arguments with a space in between
            .toLowerCase() // Convert to lowercase
            .replace(/[^a-z0-9\s]/g, '') // Remove special characters
            .trim() // Remove leading and trailing spaces
            .split(/\s+/) // Split into words
            .map((word, index) =>
                index === 0
                    ? word // First word remains lowercase
                    : word.charAt(0).toUpperCase() + word.slice(1) // Capitalize subsequent words
            )
            .join(''); // Combine into camel case
    }

    static getObjectType(object) {
        if (!object || object === undefined) {
            return 'Null';
        }
        return object.constructor.name;
    }

    static validateConfig(name, config, schema) {
        if (!config) {
            console.group(`'${name}' Config Validation Failed`);
            console.error("Config is 'null' or 'undefined'");
            console.groupEnd();
            console.log("failed");
            return false;
        }

        if (!schema) {
            console.group(`'${name}' Config Validation Failed`);
            console.error("Schema is 'null' or 'undefined'");
            console.groupEnd();
            console.log("failed");
            return false;
        }

        console.log(`Validating '${name}' Config: `, '\n', config, schema);
        const failures = [];

        // Check all required fields
        for (const [field, expectedType] of Object.entries(schema)) {
            if (!(field in config)) {
                failures.push({
                    field,
                    error: 'missing',
                    expected: expectedType,
                    actual: 'undefined'
                });
                continue;
            }

            const actualType = typeof config[field];
            if (actualType !== expectedType) {
                failures.push({
                    field,
                    error: 'type',
                    expected: expectedType,
                    actual: actualType,
                    value: config[field]
                });
            }
        }

        if (failures.length > 0) {
            console.group(`'${name}' Config Validation Failed`);
            console.warn('Failed validations:', failures);
            console.table(failures);
            console.warn('Detailed errors:', failures.map(f =>
                `${f.field}: ${f.error === 'missing' ?
                    'Missing field' :
                    `Expected ${f.expected}, got ${f.actual} (${f.value})`}`
            ));
            console.groupEnd();
            return false;
        }

        return true;
    }

    /** StackTrace Dump */
    static showStackTrace(text = '') {
        let trace = new Error(`'${text}':`);
        console.log(trace);
        trace = null;
    }

    /** Memory cleanup (anytime keyword 'new' is used */
    static destroy(item) {
        if (!item) return null;
        try {
            if (typeof item?.destroy === 'function') {
                item.destroy();
            }
            return null;
        } catch (error) {
            console.error("Destroy failed:", error);
            return item;
        }
    }
    static cleanupArray(array) {
        if (!Array.isArray(array)) return false;
        let success = true;

        try {
            for (let i = array.length - 1; i >= 0; i--) {
                if (!Functions.destroy(array[i])) {
                    success = false;
                }
                array[i] = null;
            }
            array.length = 0;
        } catch (error) {
            console.error("Cleanup Array:", error);
            success = false;
        }

        return success;
    }

    static cleanupMap(map) {
        if (!(map instanceof Map)) return false;
        let success = true;

        try {
            for (const [key, item] of map) {
                if (!Functions.destroy(item)) {
                    success = false;
                }
                map.delete(key);
            }
        } catch (error) {
            console.error("Cleanup Map:", error);
            success = false;
        }

        return success;
    }

    /** time */
    /**
     * Static method for a hard wait.
     * @param {number} ms - Duration of the wait in milliseconds.
     */
    static delay(ms) {
        const start = Date.now();
        while (Date.now() - start < ms) {
            // Busy-wait loop - burns CPU & GFX
        }
    }

    /**
     * Static method for an asynchronous wait.
     * @param {number} ms - Duration of the wait in milliseconds.
     * @returns {Promise} - A promise that resolves after the specified duration.
        console.log('Start');
        await Functions.sleep(2000); // Code stops here until complete
        console.log('After 1 second');
     */
    static sleep(ms) {
        let isDone = false;
        return new Promise(resolve => {
            setTimeout(() => {
                isDone = true;
                resolve(isDone);
            }, ms);
        });
    }

    /** Usage in game loop:
```javascript
// Example usage:
const timer = Functions.createTimer(2000); // 2 seconds

// In game loop:
if (timer.isComplete()) {
console.log('Timer completed!');
console.log('Elapsed time:', timer.getElapsed());
}
*/
    static Timer(duration, debug = false) {
        const timer = {
            startTime: performance.now(),
            duration: duration,
            isComplete: function () {
                const elapsed = this.getElapsed();
                return elapsed >= this.duration;
            },
            getElapsed: function () {
                const elapsed = performance.now() - this.startTime;
                return elapsed;
            },
            reset: function () {
                this.startTime = performance.now();
            }
        };
        return timer;
    }
}

// Export the Functions class
export default Functions;

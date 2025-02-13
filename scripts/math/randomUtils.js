// ToolboxAid.com
// David Quesenberry
// 02/12/2025
// randomUtils.js

class RandomUtils {

    /** Returns a random boolean value (true or false). */
    static randomBoolean() {
        return Math.random() < 0.5;
    }

    /** Returns a random number between min (inclusive) and max (inclusive).
     * If isInteger is true, returns an integer; otherwise, returns a floating-point number. */
    static randomRange(min, max, isInteger = true) {
        if (typeof min !== 'number' || typeof max !== 'number' || min > max) {
            throw new Error('Invalid input: min and max must be numbers, and min must be less than or equal to max.');
        }

        return isInteger
            ? Math.floor(Math.random() * (max - min + 1)) + min
            : Math.random() * (max - min) + min;
    }

    /** Returns a random floating-point number between min (inclusive) and max (exclusive). */
    static random(min, max) {
        return this.randomRange(min, max, false);
    }

    /** Returns a random integer between min (inclusive) and max (inclusive). */
    static randomInt(min, max) {
        return this.randomRange(min, max, true);
    }

}

export default RandomUtils;
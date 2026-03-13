// ToolboxAid.com
// David Quesenberry
// 10/16/2024
// timeUtils.js

class TimeUtils {

    /** Constructor for TimeUtils class. */
    constructor() {
        throw new Error('TimeUtils is a utility class with only static methods. Do not instantiate.');
    }

    /** Static method for a hard wait. */
    static delay(ms) {
        const start = Date.now();
        while (Date.now() - start < ms) {
            // Busy-wait loop - burns CPU & GFX
        }
    }

    /** Static method for an asynchronous wait. */
    static sleep(ms) {
        let isDone = false;
        return new Promise(resolve => {
            setTimeout(() => {
                isDone = true;
                resolve(isDone);
            }, ms);
        });
    }

}

export default TimeUtils;

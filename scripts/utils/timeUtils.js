// ToolboxAid.com
// David Quesenberry
// 10/16/2024
// timeUtils.js

class TimeUtils {


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

}

// Export the class
export default TimeUtils;
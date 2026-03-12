// ToolboxAid.com
// David Quesenberry
// 03/08/2026
// objectDebug.js

class ObjectDebug {
    static log(enabled, message, data = null) {
        if (!enabled) {
            return;
        }

        if (data === null) {
            console.log(message);
            return;
        }

        console.log(message, data);
    }

    static warn(enabled, message, data = null) {
        if (!enabled) {
            return;
        }

        if (data === null) {
            console.warn(message);
            return;
        }

        console.warn(message, data);
    }

    static error(enabled, message, data = null) {
        if (!enabled) {
            return;
        }

        if (data === null) {
            console.error(message);
            return;
        }

        console.error(message, data);
    }
}

export default ObjectDebug;
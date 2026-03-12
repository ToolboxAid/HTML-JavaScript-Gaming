// ToolboxAid.com
// David Quesenberry
// 03/08/2026
// objectCleanup.js

class ObjectCleanup {
    static nullifyProperties(target, propertyNames = []) {
        if (!target || typeof target !== 'object') {
            throw new Error('Target must be an object.');
        }

        if (!Array.isArray(propertyNames)) {
            throw new Error('propertyNames must be an array.');
        }

        for (const propertyName of propertyNames) {
            target[propertyName] = null;
        }
    }

    static cleanupArray(array) {
        if (!Array.isArray(array)) {
            return;
        }

        array.length = 0;
    }

    static cleanupAndNullifyArray(target, propertyName) {
        if (!target || typeof target !== 'object') {
            throw new Error('Target must be an object.');
        }

        if (Array.isArray(target[propertyName])) {
            target[propertyName].length = 0;
        }

        target[propertyName] = null;
    }
}

export default ObjectCleanup;
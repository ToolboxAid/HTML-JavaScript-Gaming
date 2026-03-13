// ToolboxAid.com
// David Quesenberry
// 03/13/2026
// objectDestroyUtils.js

import ObjectDebug from '../utils/objectDebug.js';

class ObjectDestroyUtils {
    constructor() {
        throw new Error('ObjectDestroyUtils is a utility class with only static methods. Do not instantiate.');
    }

    static shouldSkipDestroy(target, debugEnabled, label, extraInvalid = false) {
        if (!target || typeof target !== 'object') {
            throw new Error('target must be an object.');
        }

        if (target.isDestroyed || extraInvalid) {
            ObjectDebug.warn(debugEnabled, `${label} already destroyed`);
            return true;
        }

        return false;
    }
}

export default ObjectDestroyUtils;

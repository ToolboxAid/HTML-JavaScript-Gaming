// ToolboxAid.com
// David Quesenberry
// 03/13/2026
// debugFlag.js

class DebugFlag {
    constructor() {
        throw new Error('DebugFlag is a utility class with only static methods. Do not instantiate.');
    }

    static has(flagName) {
        if (typeof window === 'undefined' || !window.location) {
            return false;
        }

        return new URLSearchParams(window.location.search).has(flagName);
    }
}

export default DebugFlag;

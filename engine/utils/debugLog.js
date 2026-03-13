// ToolboxAid.com
// David Quesenberry
// 03/13/2026
// debugLog.js

class DebugLog {
    constructor() {
        throw new Error('DebugLog is a utility class with only static methods. Do not instantiate.');
    }

    static log(enabled, scope, message, ...data) {
        if (!enabled) {
            return;
        }
        this.write('log', scope, message, ...data);
    }

    static info(enabled, scope, message, ...data) {
        if (!enabled) {
            return;
        }
        this.write('info', scope, message, ...data);
    }

    static warn(enabled, scope, message, ...data) {
        if (!enabled) {
            return;
        }
        this.write('warn', scope, message, ...data);
    }

    static error(enabledOrScope, scopeOrMessage, messageOrData, ...data) {
        if (typeof enabledOrScope === 'boolean') {
            if (!enabledOrScope) {
                return;
            }

            this.write('error', scopeOrMessage, messageOrData, ...data);
            return;
        }

        if (typeof messageOrData === 'undefined') {
            this.write('error', null, scopeOrMessage);
            return;
        }

        this.write('error', enabledOrScope, scopeOrMessage, messageOrData, ...data);
    }

    static write(level, scope, message, ...data) {
        const logger = console[level] || console.log;
        const prefix = scope ? `[${scope}]` : null;

        if (typeof message === 'string') {
            const text = prefix ? `${prefix} ${message}` : message;
            if (data.length > 0) {
                logger(text, ...data);
                return;
            }

            logger(text);
            return;
        }

        if (prefix) {
            logger(prefix, message, ...data);
            return;
        }

        logger(message, ...data);
    }
}

export default DebugLog;

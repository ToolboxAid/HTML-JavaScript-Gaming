// ToolboxAid.com
// David Quesenberry
// 03/13/2026
// debugLog.js

import DebugFlag from './debugFlag.js';

class DebugLog {
    // Caller is enabled by default.
    // Disable caller extraction: game.html?noDebugCaller
    static SHOW_CALLER = !DebugFlag.has('noDebugCaller');
    // Stack dump is opt-in.
    // Enable stack dump: game.html?debugTrace
    static SHOW_TRACE = DebugFlag.has('debugTrace');

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
        const trace = (DebugLog.SHOW_CALLER || DebugLog.SHOW_TRACE) ? DebugLog.getStackTrace() : '';
        const callerLine = DebugLog.getCallerLine(trace);
        const callerSuffix = (DebugLog.SHOW_CALLER && callerLine) ? ` ${callerLine}` : '';
        const prefix = (DebugLog.SHOW_CALLER || !scope) ? null : `[${scope}]`;

        if (typeof message === 'string') {
            const text = prefix ? `${prefix} ${message}${callerSuffix}` : `${message}${callerSuffix}`;
            if (data.length > 0) {
                logger(text, ...data);
                DebugLog.writeTrace(logger, trace);
                return;
            }

            logger(text);
            DebugLog.writeTrace(logger, trace);
            return;
        }

        if (prefix) {
            logger(`${prefix}${callerSuffix}`, message, ...data);
            DebugLog.writeTrace(logger, trace);
            return;
        }

        if (callerSuffix) {
            logger(callerSuffix.trim(), message, ...data);
        } else {
            logger(message, ...data);
        }

        DebugLog.writeTrace(logger, trace);
    }

    static getCallerLine(trace) {
        if (!trace) {
            return '';
        }

        const callerLine = trace
            .split('\n')
            .map((line) => line.trim())
            .find((line) => line && !line.includes('debugLog.js') && !line.startsWith('Error'));

        if (!callerLine) {
            return '';
        }

        const rawCaller = callerLine.replace(/^at\s+/, '');
        const compactCaller = DebugLog.compactCaller(rawCaller);
        return compactCaller || rawCaller;
    }

    static compactCaller(rawCaller) {
        // Handles common forms:
        // - FunctionName (http://host/path/file.js:10:2)
        // - http://host/path/file.js:10:2
        // - FunctionName (file:///path/file.js:10:2)
        // - FunctionName (C:\\path\\file.js:10:2)
        const match = rawCaller.match(/^(.*?\()?(.*?\.js:\d+:\d+)\)?$/);
        if (!match) {
            return '';
        }

        const fnPrefix = (match[1] || '').trim();
        const fullPath = match[2];
        let compactPath = fullPath;

        const schemeIndex = compactPath.indexOf('://');
        if (schemeIndex >= 0) {
            const pathStart = compactPath.indexOf('/', schemeIndex + 3);
            if (pathStart >= 0) {
                compactPath = compactPath.slice(pathStart);
            }
        }

        const lastSlash = Math.max(compactPath.lastIndexOf('/'), compactPath.lastIndexOf('\\'));
        if (lastSlash >= 0) {
            compactPath = compactPath.slice(lastSlash);
        }

        const normalizedPath = compactPath.replace(/%20/g, ' ').replace(/^[/\\]/, '');
        if (!fnPrefix) {
            return normalizedPath;
        }

        const cleanedPrefix = fnPrefix.replace(/\($/, '').trim();
        return `${cleanedPrefix} - ${normalizedPath}`;
    }

    static writeTrace(logger, trace) {
        if (!DebugLog.SHOW_TRACE) {
            return;
        }

        if (trace) {
            logger(trace);
        }
    }

    static getStackTrace() {
        try {
            return new Error().stack || '';
        } catch {
            return '';
        }
    }
}

export default DebugLog;

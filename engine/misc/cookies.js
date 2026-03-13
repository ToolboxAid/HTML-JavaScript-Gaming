// ToolboxAid.com
// David Quesenberry
// 11/19/2024
// Cookies.js

/** example usages
// Set a cookie valid for 7 days
Cookies.set('username', 'david', { expires: 7, path: '/', secure: true });

// Set a cookie with SameSite
Cookies.set('session_id', '12345', { sameSite: 'Strict', path: '/' });
*/

import DebugFlag from '../utils/debugFlag.js';

class Cookies {

    // Enable debug mode: game.html?cookies
    static DEBUG = DebugFlag.has('cookies');

    /** Constructor for Cookies class. */
    constructor() {
        throw new Error('Cookies is a utility class with only static methods. Do not instantiate.');
    }

    static ensureDocument() {
        if (typeof document === 'undefined') {
            throw new Error('Cookies requires a browser document.');
        }
    }

    static getCookiePairs() {
        this.ensureDocument();

        if (!document.cookie || document.cookie.trim() === '') {
            return [];
        }

        return document.cookie.split('; ');
    }

    /** Set a cookie with a specified name, value, and optional settings. */
    static set(name, value, options = {}) {
        this.ensureDocument();

        if (typeof name !== 'string' || name.trim() === '') {
            throw new Error('name must be a non-empty string.');
        }

        let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

        if (options.expires) {
            if (typeof options.expires === 'number') {
                let date = new Date();
                date.setTime(date.getTime() + options.expires * 24 * 60 * 60 * 1000);
                cookieString += `; expires=${date.toUTCString()}`;
                date = null;
            } else if (options.expires instanceof Date) {
                cookieString += `; expires=${options.expires.toUTCString()}`;
            }
        }

        if (options.path) {
            cookieString += `; path=${options.path}`;
        }

        if (options.domain) {
            cookieString += `; domain=${options.domain}`;
        }

        if (options.secure) {
            cookieString += '; secure';
        }

        if (options.sameSite) {
            cookieString += `; samesite=${options.sameSite}`;
        }

        document.cookie = cookieString;
        if (Cookies.DEBUG) {
            console.log(`Cookie set: ${cookieString}`);
        }
    }

    /** Get the value of a cookie by name. */
    static get(name, options = {}) {
        if (typeof name !== 'string' || name.trim() === '') {
            throw new Error('name must be a non-empty string.');
        }

        const cookies = this.getCookiePairs();
        for (const cookie of cookies) {
            const separatorIndex = cookie.indexOf('=');
            if (separatorIndex < 0) {
                continue;
            }

            const key = cookie.slice(0, separatorIndex);
            const value = cookie.slice(separatorIndex + 1);
            if (decodeURIComponent(key) === name) {
                return decodeURIComponent(value);
            }
        }
        return null;
    }

    /** Delete a cookie by name. */
    static delete(name, options = {}) {
        this.set(name, '', { ...options, expires: -1 });
        if (Cookies.DEBUG) {
            console.log(`Cookie deleted: ${name}`);
        }
    }

    /** Get all cookies as an object. */
    static getAll() {
        const pairs = this.getCookiePairs();
        const cookies = {};

        pairs.forEach((cookie) => {
            const separatorIndex = cookie.indexOf('=');
            if (separatorIndex < 0) {
                return;
            }

            const key = cookie.slice(0, separatorIndex);
            const value = cookie.slice(separatorIndex + 1);
            cookies[decodeURIComponent(key)] = decodeURIComponent(value);
        });
        return cookies;
    }

    static sanitizeCookieName(name) {
        if (typeof name !== 'string' || name.length === 0) {
            throw new Error('name must be a non-empty string.');
        }

        return name
            .replace(/%[0-9A-Fa-f]{2}/g, match => '-')
            .replace(/\//g, '');
    }

}

export default Cookies;

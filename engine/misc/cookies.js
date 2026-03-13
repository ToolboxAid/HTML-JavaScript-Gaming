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

class Cookies {

    // Enable debug mode: game.html?cookies
    static DEBUG = new URLSearchParams(window.location.search).has('cookies');

    /** Constructor for Cookies class. */
    constructor() {
        throw new Error('Cookies is a utility class with only static methods. Do not instantiate.');
    }

    /** Set a cookie with a specified name, value, and optional settings. */
    static set(name, value, options = {}) {
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
        console.log(`Cookie set: ${cookieString}`);
    }

    /** Get the value of a cookie by name. */
    static get(name) {
        const cookies = document.cookie.split('; ');
        for (const cookie of cookies) {
            const [key, value] = cookie.split('=');
            if (decodeURIComponent(key) === name) {
                return decodeURIComponent(value);
            }
        }
        return null;
    }

    /** Delete a cookie by name. */
    static delete(name, options = {}) {
        this.set(name, '', { ...options, expires: -1 });
        console.log(`Cookie deleted: ${name}`);
    }

    /** Get all cookies as an object. */
    static getAll() {
        const cookies = {};
        document.cookie.split('; ').forEach(cookie => {
            const [key, value] = cookie.split('=');
            cookies[decodeURIComponent(key)] = decodeURIComponent(value);
        });
        return cookies;
    }

    static sanitizeCookieName(name) {
        return name
            .replace(/%[0-9A-Fa-f]{2}/g, match => '-')
            .replace(/\//g, '');
    }

}

export default Cookies;

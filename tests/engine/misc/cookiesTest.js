import Cookies from '../../../engine/misc/cookies.js';

function installCookieDocumentMock() {
    const jar = new Map();
    const mockDocument = {};

    Object.defineProperty(mockDocument, 'cookie', {
        get() {
            if (jar.size === 0) {
                return '';
            }

            return Array.from(jar.entries())
                .map(([key, value]) => `${key}=${value}`)
                .join('; ');
        },
        set(cookieString) {
            const parts = cookieString.split(';');
            const [keyPart, ...valueParts] = parts[0].split('=');
            const key = keyPart;
            const value = valueParts.join('=');

            let expiresAt = null;
            for (let i = 1; i < parts.length; i += 1) {
                const attribute = parts[i].trim();
                if (attribute.toLowerCase().startsWith('expires=')) {
                    const dateValue = attribute.slice('expires='.length);
                    expiresAt = Date.parse(dateValue);
                }
            }

            if (Number.isFinite(expiresAt) && expiresAt <= Date.now()) {
                jar.delete(key);
                return;
            }

            jar.set(key, value);
        },
        configurable: true
    });

    return mockDocument;
}

function testCookieSetGetDelete(assert) {
    const originalDocument = globalThis.document;
    globalThis.document = installCookieDocumentMock();

    try {
        Cookies.set('player', 'david', { path: '/' });
        assert(Cookies.get('player') === 'david', 'Cookies.get should return previously set value');

        const allCookies = Cookies.getAll();
        assert(allCookies.player === 'david', 'Cookies.getAll should include set cookies');

        Cookies.delete('player', { path: '/' });
        assert(Cookies.get('player') === null, 'Cookies.delete should remove cookie');
    } finally {
        globalThis.document = originalDocument;
    }
}

function testCookieNameSanitization(assert) {
    const sanitized = Cookies.sanitizeCookieName('/games%2Fasteroids/');
    assert(!sanitized.includes('/'), 'sanitizeCookieName should remove slashes');
    assert(!sanitized.includes('%2F'), 'sanitizeCookieName should remove percent-encoded sequences');

    let threw = false;
    try {
        Cookies.sanitizeCookieName('');
    } catch (error) {
        threw = true;
    }
    assert(threw, 'sanitizeCookieName should reject empty names');
}

function testCookieRequiresDocument(assert) {
    const originalDocument = globalThis.document;
    globalThis.document = undefined;

    try {
        let threw = false;
        try {
            Cookies.getAll();
        } catch (error) {
            threw = error.message.includes('browser document');
        }
        assert(threw, 'Cookies should throw when document is unavailable');
    } finally {
        globalThis.document = originalDocument;
    }
}

export function testCookies(assert) {
    testCookieSetGetDelete(assert);
    testCookieNameSanitization(assert);
    testCookieRequiresDocument(assert);
}

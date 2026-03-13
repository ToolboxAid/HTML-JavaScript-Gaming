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

function tryOverrideGlobalDocument(nextDocument) {
    const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'document');

    try {
        Object.defineProperty(globalThis, 'document', {
            value: nextDocument,
            configurable: true,
            writable: true
        });
        return () => {
            if (descriptor) {
                Object.defineProperty(globalThis, 'document', descriptor);
            }
        };
    } catch (error) {
        return null;
    }
}

function testCookieSetGetDelete(assert) {
    const restore = tryOverrideGlobalDocument(installCookieDocumentMock());

    if (restore) {
        Cookies.set('player', 'david', { path: '/' });
        assert(Cookies.get('player') === 'david', 'Cookies.get should return previously set value');

        const allCookies = Cookies.getAll();
        assert(allCookies.player === 'david', 'Cookies.getAll should include set cookies');

        Cookies.delete('player', { path: '/' });
        assert(Cookies.get('player') === null, 'Cookies.delete should remove cookie');
        restore();
        return;
    }

    // Browser fallback when global document is read-only.
    const key = `cookies_test_${Date.now()}`;
    Cookies.set(key, 'david', { path: '/' });
    assert(Cookies.get(key) === 'david', 'Cookies.get should return previously set value');
    Cookies.delete(key, { path: '/' });
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
    const restore = tryOverrideGlobalDocument(undefined);

    if (restore) {
        let threw = false;
        try {
            Cookies.getAll();
        } catch (error) {
            threw = error.message.includes('browser document');
        }
        assert(threw, 'Cookies should throw when document is unavailable');
        restore();
        return;
    }

    // Browser fallback: cannot override document in this environment.
    assert(true, 'Skipped document-unavailable branch in browser runtime.');
}

export function testCookies(assert) {
    testCookieSetGetDelete(assert);
    testCookieNameSanitization(assert);
    testCookieRequiresDocument(assert);
}

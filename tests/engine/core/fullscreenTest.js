// ToolboxAid.com
// David Quesenberry
// 03/15/2026
// fullscreenTest.js

import Fullscreen from '../../../engine/fullscreen.js';

export function testFullscreen(assert) {
    const originalWindow = globalThis.window;
    const originalDocument = globalThis.document;

    const removedWindowEvents = [];
    const removedDocumentEvents = [];

    const windowStub = {
        location: { search: '' },
        addEventListener() {},
        removeEventListener(eventName) {
            removedWindowEvents.push(eventName);
        }
    };

    const ctx = {
        clearRect() {},
        setTransform() {}
    };

    const canvas = {
        width: 0,
        height: 0,
        style: {},
        addEventListener() {},
        removeEventListener() {},
        getContext() {
            return ctx;
        }
    };

    const documentStub = {
        fullscreenElement: null,
        webkitFullscreenElement: null,
        msFullscreenElement: null,
        addEventListener() {},
        removeEventListener(eventName) {
            removedDocumentEvents.push(eventName);
        },
        getElementById(id) {
            return id === 'gameArea' ? canvas : null;
        }
    };

    globalThis.window = windowStub;
    globalThis.document = documentStub;

    try {
        const hookCalls = [];
        Fullscreen.canvas = canvas;
        Fullscreen.ctx = ctx;
        Fullscreen.canvasWidth = 800;
        Fullscreen.canvasHeight = 600;
        Fullscreen.scale = 0.5;
        Fullscreen.onResizeHook = (payload) => hookCalls.push(payload);

        Fullscreen.resizeCanvas('unit');
        assert(canvas.width === 800, 'Fullscreen.resizeCanvas should keep backing width at canvasConfig width');
        assert(canvas.height === 600, 'Fullscreen.resizeCanvas should keep backing height at canvasConfig height');
        assert(canvas.style.width === '400px', 'Fullscreen.resizeCanvas should scale displayed width in windowed mode');
        assert(canvas.style.height === '300px', 'Fullscreen.resizeCanvas should scale displayed height in windowed mode');
        assert(hookCalls.some((call) => call.reason === 'unit'), 'Fullscreen.resizeCanvas should notify onResize hook with reason');

        documentStub.fullscreenElement = canvas;
        Fullscreen.resizeCanvas('fullscreenchange');
        assert(canvas.style.width === '800px', 'Fullscreen.resizeCanvas should use full scale width in fullscreen mode');
        assert(canvas.style.height === '600px', 'Fullscreen.resizeCanvas should use full scale height in fullscreen mode');
        assert(hookCalls.some((call) => call.reason === 'fullscreenchange' && call.isFullScreen === true), 'Fullscreen hook payload should include fullscreen state');

        Fullscreen.listenersRegistered = true;
        Fullscreen.resizeBound = () => {};
        Fullscreen.canvasClickBound = () => {};
        Fullscreen.fullscreenChangeBound = () => {};
        Fullscreen.onResizeHook = () => {};

        const destroyResult = Fullscreen.destroy();
        assert(destroyResult === true, 'Fullscreen.destroy should succeed when listeners are registered');
        assert(Fullscreen.listenersRegistered === false, 'Fullscreen.destroy should clear listener registration state');
        assert(Fullscreen.onResizeHook === null, 'Fullscreen.destroy should clear onResize hook');
        assert(removedWindowEvents.includes('resize'), 'Fullscreen.destroy should unbind resize listener');
        assert(removedDocumentEvents.includes('fullscreenchange'), 'Fullscreen.destroy should unbind fullscreenchange listener');
    } finally {
        globalThis.window = originalWindow;
        globalThis.document = originalDocument;
        Fullscreen.listenersRegistered = false;
        Fullscreen.resizeBound = null;
        Fullscreen.canvasClickBound = null;
        Fullscreen.fullscreenChangeBound = null;
        Fullscreen.onResizeHook = null;
    }
}

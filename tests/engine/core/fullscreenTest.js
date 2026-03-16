// ToolboxAid.com
// David Quesenberry
// 03/15/2026
// fullscreenTest.js

import Fullscreen from '../../../engine/core/fullscreen.js';

export function testFullscreen(assert) {
    const removedWindowEvents = [];
    const removedDocumentEvents = [];
    const originalWindowRemoveEventListener = window.removeEventListener;
    const originalDocumentRemoveEventListener = document.removeEventListener;
    const originalIsFullscreenActive = Fullscreen.isFullscreenActive;
    const originalFullscreenState = {
        canvas: Fullscreen.canvas,
        ctx: Fullscreen.ctx,
        canvasWidth: Fullscreen.canvasWidth,
        canvasHeight: Fullscreen.canvasHeight,
        scale: Fullscreen.scale,
        isFullScreen: Fullscreen.isFullScreen,
        listenersRegistered: Fullscreen.listenersRegistered,
        resizeBound: Fullscreen.resizeBound,
        canvasClickBound: Fullscreen.canvasClickBound,
        fullscreenChangeBound: Fullscreen.fullscreenChangeBound,
        onResizeHook: Fullscreen.onResizeHook
    };

    const ctx = {
        saveCalls: 0,
        restoreCalls: 0,
        textAlign: 'center',
        fillTextCalls: [],
        clearRect() {},
        setTransform() {},
        save() { this.saveCalls += 1; },
        restore() { this.restoreCalls += 1; },
        fillText(text, x, y) {
            this.fillTextCalls.push({ text, x, y });
        }
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

    window.removeEventListener = (eventName) => {
        removedWindowEvents.push(eventName);
    };
    document.removeEventListener = (eventName) => {
        removedDocumentEvents.push(eventName);
    };

    try {
        const hookCalls = [];
        Fullscreen.canvas = canvas;
        Fullscreen.ctx = ctx;
        Fullscreen.canvasWidth = 800;
        Fullscreen.canvasHeight = 600;
        Fullscreen.scale = 0.5;
        Fullscreen.onResizeHook = (payload) => hookCalls.push(payload);

        Fullscreen.isFullscreenActive = () => false;
        Fullscreen.resizeCanvas('unit');
        assert(canvas.width === 800, 'Fullscreen.resizeCanvas should keep backing width at canvasConfig width');
        assert(canvas.height === 600, 'Fullscreen.resizeCanvas should keep backing height at canvasConfig height');
        assert(canvas.style.width === '400px', 'Fullscreen.resizeCanvas should scale displayed width in windowed mode');
        assert(canvas.style.height === '300px', 'Fullscreen.resizeCanvas should scale displayed height in windowed mode');
        assert(hookCalls.some((call) => call.reason === 'unit'), 'Fullscreen.resizeCanvas should notify onResize hook with reason');

        Fullscreen.config = { color: '#fff', font: '12px monospace', text: 'toggle', x: 10, y: 20 };
        Fullscreen.isFullScreen = false;
        Fullscreen.draw(null);
        Fullscreen.draw(ctx);
        assert(ctx.saveCalls === 1 && ctx.restoreCalls === 1, 'Fullscreen.draw should preserve canvas state with save/restore');
        assert(ctx.fillTextCalls.length === 1, 'Fullscreen.draw should render prompt text in windowed mode');

        Fullscreen.isFullscreenActive = () => true;
        Fullscreen.resizeCanvas('fullscreenchange');
        assert(canvas.style.width === '800px', 'Fullscreen.resizeCanvas should use full scale width in fullscreen mode');
        assert(canvas.style.height === '600px', 'Fullscreen.resizeCanvas should use full scale height in fullscreen mode');
        assert(hookCalls.some((call) => call.reason === 'fullscreenchange' && call.isFullScreen === true), 'Fullscreen hook payload should include fullscreen state');

        Fullscreen.listenersRegistered = true;
        Fullscreen.resizeBound = () => {};
        Fullscreen.canvasClickBound = () => {};
        Fullscreen.fullscreenChangeBound = () => {};
        Fullscreen.onResizeHook = () => {};
        Fullscreen.isFullScreen = true;

        const destroyResult = Fullscreen.destroy();
        assert(destroyResult === true, 'Fullscreen.destroy should succeed when listeners are registered');
        assert(Fullscreen.listenersRegistered === false, 'Fullscreen.destroy should clear listener registration state');
        assert(Fullscreen.onResizeHook === null, 'Fullscreen.destroy should clear onResize hook');
        assert(Fullscreen.canvas === null, 'Fullscreen.destroy should clear cached canvas reference');
        assert(Fullscreen.ctx === null, 'Fullscreen.destroy should clear cached context reference');
        assert(Fullscreen.isFullScreen === false, 'Fullscreen.destroy should reset fullscreen state');
        assert(removedWindowEvents.includes('resize'), 'Fullscreen.destroy should unbind resize listener');
        assert(removedDocumentEvents.includes('fullscreenchange'), 'Fullscreen.destroy should unbind fullscreenchange listener');
    } finally {
        window.removeEventListener = originalWindowRemoveEventListener;
        document.removeEventListener = originalDocumentRemoveEventListener;
        Fullscreen.isFullscreenActive = originalIsFullscreenActive;
        Fullscreen.canvas = originalFullscreenState.canvas;
        Fullscreen.ctx = originalFullscreenState.ctx;
        Fullscreen.canvasWidth = originalFullscreenState.canvasWidth;
        Fullscreen.canvasHeight = originalFullscreenState.canvasHeight;
        Fullscreen.scale = originalFullscreenState.scale;
        Fullscreen.isFullScreen = originalFullscreenState.isFullScreen;
        Fullscreen.listenersRegistered = originalFullscreenState.listenersRegistered;
        Fullscreen.resizeBound = originalFullscreenState.resizeBound;
        Fullscreen.canvasClickBound = originalFullscreenState.canvasClickBound;
        Fullscreen.fullscreenChangeBound = originalFullscreenState.fullscreenChangeBound;
        Fullscreen.onResizeHook = originalFullscreenState.onResizeHook;
    }
}

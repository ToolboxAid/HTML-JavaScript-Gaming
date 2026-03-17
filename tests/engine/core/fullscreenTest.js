// ToolboxAid.com
// David Quesenberry
// 03/15/2026
// fullscreenTest.js

import Fullscreen from '../../../engine/core/fullscreen.js';

export async function testFullscreen(assert) {
    const removedWindowEvents = [];
    const removedDocumentEvents = [];
    const originalWindowRemoveEventListener = window.removeEventListener;
    const originalDocumentRemoveEventListener = document.removeEventListener;
    const originalIsFullscreenActive = Fullscreen.isFullscreenActive;
    const originalFullscreenState = {
        canvas: Fullscreen.canvas,
        ctx: Fullscreen.ctx,
        listenerCanvas: Fullscreen.listenerCanvas,
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
        addedEvents: [],
        removedEvents: [],
        addEventListener() {},
        removeEventListener() {},
        getContext() {
            return ctx;
        }
    };
    canvas.addEventListener = (eventName) => { canvas.addedEvents.push(eventName); };
    canvas.removeEventListener = (eventName) => { canvas.removedEvents.push(eventName); };

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
        Fullscreen.ctx = null;
        Fullscreen.draw();
        Fullscreen.ctx = ctx;
        Fullscreen.draw();
        assert(ctx.saveCalls === 1 && ctx.restoreCalls === 1, 'Fullscreen.draw should preserve canvas state with save/restore');
        assert(ctx.fillTextCalls.length === 1, 'Fullscreen.draw should render prompt text in windowed mode');

        Fullscreen.isFullscreenActive = () => true;
        Fullscreen.resizeCanvas('fullscreenchange');
        assert(canvas.style.width === '800px', 'Fullscreen.resizeCanvas should use full scale width in fullscreen mode');
        assert(canvas.style.height === '600px', 'Fullscreen.resizeCanvas should use full scale height in fullscreen mode');
        assert(hookCalls.some((call) => call.reason === 'fullscreenchange' && call.isFullScreen === true), 'Fullscreen hook payload should include fullscreen state');

        const replacementCanvas = {
            width: 0,
            height: 0,
            style: {},
            addedEvents: [],
            removedEvents: [],
            addEventListener(eventName) { this.addedEvents.push(eventName); },
            removeEventListener(eventName) { this.removedEvents.push(eventName); },
            getContext() {
                return ctx;
            }
        };

        const originalGetElementById = document.getElementById;
        document.getElementById = () => replacementCanvas;
        try {
            Fullscreen.listenersRegistered = true;
            Fullscreen.canvasClickBound = () => {};
            Fullscreen.listenerCanvas = canvas;
            await Fullscreen.init({ color: '#fff', font: '12px monospace', text: 'toggle', x: 10, y: 20 }, { width: 800, height: 600, scale: 0.5 });
            assert(canvas.removedEvents.includes('click'), 'Fullscreen.init should unbind click listener from the old canvas when the canvas changes');
            assert(replacementCanvas.addedEvents.includes('click'), 'Fullscreen.init should bind click listener to the new canvas when the canvas changes');
        } finally {
            document.getElementById = originalGetElementById;
        }

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

        Fullscreen.canvas = replacementCanvas;
        Fullscreen.ctx = ctx;
        Fullscreen.onResizeHook = () => {};
        Fullscreen.listenerCanvas = replacementCanvas;
        Fullscreen.listenersRegistered = false;
        const staleDestroyResult = Fullscreen.destroy();
        assert(staleDestroyResult === false, 'Fullscreen.destroy should report false when no listeners were registered');
        assert(Fullscreen.canvas === null, 'Fullscreen.destroy should still clear cached canvas when no listeners were registered');
        assert(Fullscreen.ctx === null, 'Fullscreen.destroy should still clear cached context when no listeners were registered');
        assert(Fullscreen.onResizeHook === null, 'Fullscreen.destroy should still clear the resize hook when no listeners were registered');
    } finally {
        window.removeEventListener = originalWindowRemoveEventListener;
        document.removeEventListener = originalDocumentRemoveEventListener;
        Fullscreen.isFullscreenActive = originalIsFullscreenActive;
        Fullscreen.canvas = originalFullscreenState.canvas;
        Fullscreen.ctx = originalFullscreenState.ctx;
        Fullscreen.listenerCanvas = originalFullscreenState.listenerCanvas;
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

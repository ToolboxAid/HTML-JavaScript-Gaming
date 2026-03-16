import RuntimeContext from '../../../engine/core/runtimeContext.js';

export async function testRuntimeContext(assert) {
    const calls = [];

    const fakeCanvas = {
        ctx: { tag: 'ctx' },
        async init(config) { calls.push(['canvas.init', config]); },
        canvasClear() { calls.push(['canvas.clear']); },
        drawBorder() { calls.push(['canvas.border']); },
        calculateTextMetrics(text, fontSize, font) {
            calls.push(['canvas.metrics', text, fontSize, font]);
            return { width: 10, height: 5 };
        }
    };

    const fakeFullscreen = {
        async init(config, canvasConfig) { calls.push(['fullscreen.init', config, canvasConfig]); },
        draw(ctx) { calls.push(['fullscreen.draw', ctx?.tag || null]); },
        destroy() { calls.push(['fullscreen.destroy']); }
    };

    const fakePerformance = {
        async init(config) { calls.push(['performance.init', config]); },
        update(ms) { calls.push(['performance.update', ms]); },
        draw(ctx) { calls.push(['performance.draw', ctx?.tag || null]); },
        stopMonitoring() { calls.push(['performance.stop']); }
    };

    const fakeTimer = {
        pauseAllForVisibility() { calls.push(['timer.pause']); },
        resumeAllFromVisibility() { calls.push(['timer.resume']); }
    };

    const runtime = new RuntimeContext({
        canvas: fakeCanvas,
        fullscreen: fakeFullscreen,
        performance: fakePerformance,
        timer: fakeTimer
    });

    await runtime.initialize({ width: 100 }, { fps: true }, { enabled: true });
    assert(calls.some(call => call[0] === 'canvas.init'), 'RuntimeContext should initialize canvas');
    assert(calls.some(call => call[0] === 'fullscreen.init'), 'RuntimeContext should initialize fullscreen');
    assert(calls.some(call => call[0] === 'performance.init'), 'RuntimeContext should initialize performance');

    runtime.onPageHidden();
    runtime.onPageVisible();
    assert(calls.some(call => call[0] === 'timer.pause'), 'RuntimeContext should pause timers on hidden');
    assert(calls.some(call => call[0] === 'timer.resume'), 'RuntimeContext should resume timers on visible');

    runtime.clearCanvas();
    runtime.drawBorder();
    runtime.updatePerformance(4.5);
    runtime.drawFullscreenOverlay();
    runtime.drawPerformanceOverlay();
    const metrics = runtime.calculateTextMetrics('hi', 12, 'monospace');

    assert(metrics.width === 10 && metrics.height === 5, 'RuntimeContext should proxy text metrics');
    assert(calls.some(call => call[0] === 'canvas.clear'), 'RuntimeContext should proxy clearCanvas');
    assert(calls.some(call => call[0] === 'performance.update' && call[1] === 4.5), 'RuntimeContext should proxy performance updates');

    runtime.destroy();
    assert(calls.some(call => call[0] === 'performance.stop'), 'RuntimeContext.destroy should stop performance monitoring');
    assert(calls.some(call => call[0] === 'fullscreen.destroy'), 'RuntimeContext.destroy should destroy fullscreen runtime services');

    const sparseRuntime = new RuntimeContext({
        canvas: { ctx: null },
        fullscreen: {},
        performance: {},
        timer: {}
    });

    assert(sparseRuntime.getContext() === null, 'RuntimeContext.getContext should return null when canvas context is unavailable');
    sparseRuntime.onPageHidden();
    sparseRuntime.onPageVisible();
    sparseRuntime.clearCanvas();
    sparseRuntime.drawBorder();
    sparseRuntime.updatePerformance(1.5);
    sparseRuntime.drawFullscreenOverlay();
    sparseRuntime.drawPerformanceOverlay();
    const fallbackMetrics = sparseRuntime.calculateTextMetrics('hi');
    assert(fallbackMetrics.width === 0 && fallbackMetrics.height === 0, 'RuntimeContext.calculateTextMetrics should fall back when canvas metrics are unavailable');
}

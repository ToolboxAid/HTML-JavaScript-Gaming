import PerformanceMonitor from '../../../engine/core/performanceMonitor.js';
import CanvasText from '../../../engine/core/canvasText.js';

export function testPerformanceMonitor(assert) {
    const originalState = {
        availableTimeMs: PerformanceMonitor.availableTimeMs,
        totalTimeSpentMs: PerformanceMonitor.totalTimeSpentMs,
        frameSampleCount: PerformanceMonitor.frameSampleCount,
        gfxPercentUsage: PerformanceMonitor.gfxPercentUsage,
        monitorIntervalId: PerformanceMonitor.monitorIntervalId,
        frameCount: PerformanceMonitor.frameCount,
        fps: PerformanceMonitor.fps,
        lastFrame: PerformanceMonitor.lastFrame,
        performanceConfig: PerformanceMonitor.performanceConfig,
        metrics: PerformanceMonitor.metrics,
        layoutCache: PerformanceMonitor.layoutCache
    };
    const originalSetInterval = globalThis.setInterval;
    const originalClearInterval = globalThis.clearInterval;
    const originalCalculateTextMetrics = CanvasText.calculateTextMetrics;
    const originalWindow = globalThis.window;

    try {
        PerformanceMonitor.availableTimeMs = 16.67;
        PerformanceMonitor.totalTimeSpentMs = 0;
        PerformanceMonitor.frameSampleCount = 0;
        PerformanceMonitor.gfxPercentUsage = 0;
        PerformanceMonitor.monitorIntervalId = null;

        PerformanceMonitor.updateGFX(10);
        PerformanceMonitor.updateGFX(20);
        PerformanceMonitor.calcGFX();

        const expectedAverage = 15;
        const expectedUsage = (expectedAverage / PerformanceMonitor.availableTimeMs) * 100;
        assert(
            Math.abs(PerformanceMonitor.gfxPercentUsage - expectedUsage) < 0.001,
            'PerformanceMonitor.calcGFX should average only collected frame samples'
        );
        assert(PerformanceMonitor.frameSampleCount === 0, 'PerformanceMonitor.calcGFX should reset frame sample count');
        assert(PerformanceMonitor.totalTimeSpentMs === 0, 'PerformanceMonitor.calcGFX should reset accumulated frame time');

        PerformanceMonitor.calcGFX();
        assert(PerformanceMonitor.gfxPercentUsage === 0, 'PerformanceMonitor.calcGFX should return 0 usage when no frame samples were collected');

        let scheduledInterval = null;
        let clearedInterval = null;
        globalThis.setInterval = (callback, delay) => {
            scheduledInterval = { callback, delay, id: 42 };
            return 42;
        };
        globalThis.clearInterval = (intervalId) => {
            clearedInterval = intervalId;
        };

        assert(PerformanceMonitor.startMonitoring() === true, 'PerformanceMonitor.startMonitoring should start exactly once');
        assert(scheduledInterval?.delay === 1000, 'PerformanceMonitor.startMonitoring should use a 1 second cadence');
        assert(PerformanceMonitor.startMonitoring() === false, 'PerformanceMonitor.startMonitoring should not duplicate the interval');
        assert(PerformanceMonitor.stopMonitoring() === true, 'PerformanceMonitor.stopMonitoring should clear the active interval');
        assert(clearedInterval === 42, 'PerformanceMonitor.stopMonitoring should clear the scheduled interval');
        assert(PerformanceMonitor.monitorIntervalId === null, 'PerformanceMonitor.stopMonitoring should clear the stored interval id');
        assert(PerformanceMonitor.frameCount === 0, 'PerformanceMonitor.stopMonitoring should reset frame count');
        assert(PerformanceMonitor.fps === 0, 'PerformanceMonitor.stopMonitoring should reset fps');
        assert(PerformanceMonitor.lastFrame === null, 'PerformanceMonitor.stopMonitoring should clear lastFrame');
        assert(PerformanceMonitor.stopMonitoring() === false, 'PerformanceMonitor.stopMonitoring should no-op when already stopped');

        PerformanceMonitor.frameCount = 9;
        PerformanceMonitor.fps = 55;
        PerformanceMonitor.totalTimeSpentMs = 44;
        PerformanceMonitor.frameSampleCount = 3;
        PerformanceMonitor.gfxPercentUsage = 99;
        PerformanceMonitor.lastFrame = 12345;
        CanvasText.calculateTextMetrics = () => ({ width: 10, height: 5 });
        await PerformanceMonitor.init({
            show: true,
            size: 20,
            font: 'monospace',
            colorLow: '#0f0',
            colorMed: '#ff0',
            colorHigh: '#f00',
            backgroundColor: '#000',
            x: 0,
            y: 0
        });
        assert(PerformanceMonitor.frameCount === 0, 'PerformanceMonitor.init should reset frame count');
        assert(PerformanceMonitor.fps === 0, 'PerformanceMonitor.init should reset fps');
        assert(PerformanceMonitor.totalTimeSpentMs === 0, 'PerformanceMonitor.init should reset total time');
        assert(PerformanceMonitor.frameSampleCount === 0, 'PerformanceMonitor.init should reset sample count');
        assert(PerformanceMonitor.gfxPercentUsage === 0, 'PerformanceMonitor.init should reset gfx usage');
        assert(PerformanceMonitor.lastFrame === null, 'PerformanceMonitor.init should clear lastFrame');
        assert(PerformanceMonitor.layoutCache === null, 'PerformanceMonitor.init should clear cached layout measurements');

        const panelLayout = PerformanceMonitor.getPanelLayout(20, 'monospace');
        assert(panelLayout.maxWidth === 10, 'PerformanceMonitor.getPanelLayout should use cached template measurements');
        assert(panelLayout.lineHeight === 6, 'PerformanceMonitor.getPanelLayout should derive line height from template measurements');
        assert(PerformanceMonitor.layoutCache?.signature === '20|monospace', 'PerformanceMonitor layout cache should key off font settings');

        try {
            delete globalThis.window;
        } catch {
            globalThis.window = undefined;
        }
        PerformanceMonitor.updateMemoryMetrics();
        assert(PerformanceMonitor.metrics.memory.used === 'N/A', 'PerformanceMonitor.updateMemoryMetrics should fall back safely without window');
    } finally {
        PerformanceMonitor.availableTimeMs = originalState.availableTimeMs;
        PerformanceMonitor.totalTimeSpentMs = originalState.totalTimeSpentMs;
        PerformanceMonitor.frameSampleCount = originalState.frameSampleCount;
        PerformanceMonitor.gfxPercentUsage = originalState.gfxPercentUsage;
        PerformanceMonitor.monitorIntervalId = originalState.monitorIntervalId;
        PerformanceMonitor.frameCount = originalState.frameCount;
        PerformanceMonitor.fps = originalState.fps;
        PerformanceMonitor.lastFrame = originalState.lastFrame;
        PerformanceMonitor.performanceConfig = originalState.performanceConfig;
        PerformanceMonitor.metrics = originalState.metrics;
        PerformanceMonitor.layoutCache = originalState.layoutCache;
        CanvasText.calculateTextMetrics = originalCalculateTextMetrics;
        globalThis.window = originalWindow;
        globalThis.setInterval = originalSetInterval;
        globalThis.clearInterval = originalClearInterval;
    }
}

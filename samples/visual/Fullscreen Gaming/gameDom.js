// ToolboxAid.com
// David Quesenberry
// 03/15/2026
// gameDom.js

export function createEmptyMetrics({ gameScale = 1, sampleState = 'attract' } = {}) {
    return {
        canvasWidth: 0,
        canvasHeight: 0,
        containerWidth: 0,
        containerHeight: 0,
        documentWidth: 0,
        documentHeight: 0,
        windowWidth: 0,
        windowHeight: 0,
        screenWidth: 0,
        screenHeight: 0,
        gameScale,
        fullscreenActive: false,
        sampleState
    };
}

export function getMetricsElements() {
    return {
        canW: document.getElementById('canW'),
        divW: document.getElementById('divW'),
        docW: document.getElementById('docW'),
        wdowW: document.getElementById('wdowW'),
        scrnW: document.getElementById('scrnW'),
        gameScaleWindow: document.getElementById('gameScaleWindow'),
        fullscreenState: document.getElementById('fullscreenState'),
        sampleState: document.getElementById('sampleState')
    };
}

export function collectMetrics({ gameScale = 1, sampleState = 'attract' } = {}) {
    const canvas = document.getElementById('gameArea');
    const container = document.getElementById('gameAreaContainer');
    const containerBounds = container?.getBoundingClientRect();

    return {
        canvasWidth: canvas?.clientWidth ?? 0,
        canvasHeight: canvas?.clientHeight ?? 0,
        containerWidth: Math.round(containerBounds?.width ?? 0),
        containerHeight: Math.round(containerBounds?.height ?? 0),
        documentWidth: document.documentElement.clientWidth,
        documentHeight: document.documentElement.clientHeight,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        screenWidth: screen.width,
        screenHeight: screen.height,
        gameScale,
        fullscreenActive: Boolean(document.fullscreenElement),
        sampleState
    };
}

export function updateMetricsPanel(elements, metrics) {
    if (!elements) {
        return;
    }

    setText(elements.canW, `${metrics.canvasWidth} x ${metrics.canvasHeight}`);
    setText(elements.divW, `${metrics.containerWidth} x ${metrics.containerHeight}`);
    setText(elements.docW, `${metrics.documentWidth} x ${metrics.documentHeight}`);
    setText(elements.wdowW, `${metrics.windowWidth} x ${metrics.windowHeight}`);
    setText(elements.scrnW, `${metrics.screenWidth} x ${metrics.screenHeight}`);
    setText(elements.gameScaleWindow, `${metrics.gameScale}`);
    setText(elements.fullscreenState, metrics.fullscreenActive ? 'on' : 'off');
    setText(elements.sampleState, metrics.sampleState);
}

function setText(element, value) {
    if (!element) {
        return;
    }

    element.textContent = value;
}

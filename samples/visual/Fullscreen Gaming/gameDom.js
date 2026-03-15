// ToolboxAid.com
// David Quesenberry
// 03/15/2026
// gameDom.js

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

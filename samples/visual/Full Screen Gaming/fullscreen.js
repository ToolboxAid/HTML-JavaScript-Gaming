// ToolboxAid.com
// David Quesenberry
// fullscreen.js
// 03/15/2026

import Fullscreen from '../../../engine/fullscreen.js';

const fullscreenConfig = {
    color: 'yellow',
    font: '32px Arial',
    text: 'Click canvas to toggle fullscreen',
    x: 130,
    y: 560
};

const canvasConfig = {
    width: gameAreaWidth,
    height: gameAreaHeight,
    scale: gameScaleWindow
};

function redrawSample() {
    const canvas = document.getElementById('gameArea');
    const ctx = canvas?.getContext?.('2d');
    if (!canvas || !ctx) {
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (typeof window.drawShape === 'function') {
        window.drawShape();
    }
    if (typeof window.setDivs === 'function') {
        window.setDivs();
    }
}

async function initFullscreenSample() {
    await Fullscreen.init(fullscreenConfig, canvasConfig, {
        onResize: () => redrawSample()
    });
}

window.addEventListener('beforeunload', () => {
    Fullscreen.destroy();
});

document.addEventListener('DOMContentLoaded', () => {
    initFullscreenSample().catch((error) => {
        console.error('Fullscreen sample initialization failed:', error);
    });
});

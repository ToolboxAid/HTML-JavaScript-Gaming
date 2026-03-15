// ToolboxAid.com
// David Quesenberry
// global.js
// 03/15/2026

export const canvasConfig = {
    width: 800,
    height: 600,
    scale: 0.5,
    backgroundColor: '#1a0f4b',
    borderColor: '#ed9700',
    borderSize: 10,
};

export const uiFont = Object.freeze({
    display: 'Segoe UI',
    ui: 'Segoe UI',
    mono: 'monospace'
});

export const fullscreenConfig = {
    color: '#ed9700',
    font: `28px ${uiFont.ui}`,
    text: 'Click the canvas to toggle fullscreen.',
    x: 150,
    y: 566
};

export const moveObjectsUi = {
    theme: {
        colors: {
            textPrimary: '#ffffff',
            textSecondary: '#f5d7a4',
            muted: '#d6c4ff',
            accent: '#ed9700',
            panelBackdrop: '#120530cc',
            panel: '#3600afcc',
            playPanel: '#2b0b87cc'
        },
        panelX: 74,
        panelY: 96,
        panelWidth: 652,
        panelHeight: 330,
        panelBorderSize: 3,
        panelColor: '#3600afcc',
        panelBorderColor: '#ed9700',
        playPanelColor: '#2b0b87cc',
        accentColor: '#ed9700'
    },
    attract: {
        title: 'Move Objects',
        prompt: 'Press Enter to start the motion demo',
        subtitle: 'Follow a moving circle as it bounces off the playfield bounds.',
        help: 'Use this sample to study update loops, delta time, and simple boundary response.',
        titleY: 148,
        promptY: 232,
        subtitleY: 286,
        helpY: 326
    },
    play: {
        titleY: 148,
        subtitleY: 200,
        promptY: 228,
        subtitle: 'Click the canvas to toggle fullscreen.',
        prompt: 'Press Enter again to return to the intro screen.'
    }
};

export const performanceConfig = {
    show: true,
    size: 10,
    font: uiFont.mono,
    colorLow: 'green',
    colorMed: '#ed9700',
    colorHigh: '#ff5f57',
    backgroundColor: '#999999cc',
    x: 8,
    y: 5,
};

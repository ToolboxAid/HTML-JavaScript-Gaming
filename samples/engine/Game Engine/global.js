// ToolboxAid.com
// David Quesenberry
// global.js
// 03/15/2026

import DebugFlag from '../../../engine/utils/debugFlag.js';

export const canvasConfig = {
    width: 1024,
    height: 768,
    scale: 0.35,
    backgroundColor: '#1f0b57',
    borderColor: '#ed9700',
    borderSize: 15,
};
export const uiFont = Object.freeze({
    display: 'Segoe UI',
    ui: 'Segoe UI',
    mono: 'monospace'
});

export const safeArea = Object.freeze({
    x: 20,
    y: 20
});

export const fullscreenConfig = {
    color: '#ed9700',
    font: `28px ${uiFont.ui}`,
    text: 'Click the canvas to toggle fullscreen.',
    x: 220,
    y: 730
};

export const playerSelect = {
    maxPlayers: 2,
    lives: 3,
    optionBaseY: 300,
    optionSpacing: 40
};

const themeColors = Object.freeze({
    textPrimary: '#ffffff',
    textSecondary: '#f3d8ab',
    accent: '#ed9700',
    danger: '#ff845f',
    panel: '#200c5acc',
    panelBackdrop: '#120629cc',
    panelDanger: '#3a1220cc',
    panelPause: '#24104acc',
    panelPlay: '#1b0a4ccc',
    pauseBorder: '#77f0ff'
});

export const gameUi = {
    theme: {
        colors: themeColors,
        panelX: 120,
        panelY: 120,
        panelWidth: 784,
        panelHeight: 430,
        panelBorderSize: 3,
        panelColor: themeColors.panel,
        panelBorderColor: themeColors.accent,
        accentColor: themeColors.accent,
        subtitleColor: themeColors.textSecondary
    },
    performance: {
        show: DebugFlag.has('perf'),
        size: 24,
        font: uiFont.mono,
        colorLow: '#72f1b8',
        colorMed: themeColors.accent,
        colorHigh: '#ff6b6b',
        backgroundColor: '#20104fcc',
        x: canvasConfig.width - 344,
        y: canvasConfig.height - 178
    },
    screens: {
        attract: {
            lines: [
                { text: 'Welcome to the Game!', y: 180, fontSize: 46, fontFamily: uiFont.display, color: themeColors.textPrimary },
                { text: 'Press `Enter` to Start', y: 275, fontSize: 30, fontFamily: uiFont.ui, color: themeColors.textPrimary },
                { text: 'Starter template ready for your game logic', y: 325, fontSize: 24, fontFamily: uiFont.ui, color: themeColors.textSecondary }
            ]
        },
        playerSelect: {
            lines: [
                { text: 'Select Players', y: 170, fontSize: 42, fontFamily: uiFont.display, color: themeColors.textPrimary },
                { text: 'Press 1 or 2 to begin', y: 262, fontSize: 24, fontFamily: uiFont.ui, color: themeColors.textSecondary }
            ],
            options: {
                lines: ['Keyboard `1` for 1 Player', 'Keyboard `2` for 2 Players'],
                fontSize: 26,
                lineHeight: 54,
                fontFamily: uiFont.ui,
                color: themeColors.textSecondary
            }
        },
        gameOver: {
            panelColor: themeColors.panelDanger,
            borderColor: themeColors.danger,
            lines: [
                { text: 'Game Over', y: 185, fontSize: 52, fontFamily: uiFont.display, color: themeColors.danger },
                { text: 'Press `Enter` to Restart', y: 280, fontSize: 30, fontFamily: uiFont.ui, color: themeColors.danger },
                { text: 'Restarting returns to attract mode', y: 330, fontSize: 22, fontFamily: uiFont.ui, color: themeColors.textSecondary }
            ]
        },
        pause: {
            panelColor: themeColors.panelPause,
            borderColor: themeColors.pauseBorder,
            lines: [
                { text: 'Game Paused.', y: 270, fontSize: 46, fontFamily: uiFont.display, color: themeColors.textPrimary },
                { text: 'Press `P` to unpause game', y: 330, fontSize: 34, fontFamily: uiFont.ui, color: themeColors.textPrimary },
                { text: 'State and timers remain preserved', y: 385, fontSize: 22, fontFamily: uiFont.ui, color: themeColors.textSecondary }
            ]
        },
        play: {
            panelColor: themeColors.panelPlay,
            borderColor: themeColors.accent,
            infoY: 170,
            infoFontSize: 34,
            infoFontFamily: uiFont.ui,
            infoColor: themeColors.textPrimary,
            promptsY: 250,
            prompts: ['Press `D` for player death', 'Press `S` for score', 'Press `P` to pause game'],
            promptFontSize: 24,
            promptLineHeight: 50,
            promptFontFamily: uiFont.ui,
            promptColor: themeColors.textSecondary
        }
    }
};

export const performanceConfig = gameUi.performance;

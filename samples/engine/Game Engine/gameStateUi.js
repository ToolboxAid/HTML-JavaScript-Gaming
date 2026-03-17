// ToolboxAid.com
// David Quesenberry
// 03/15/2026
// gameStateUi.js

import CanvasUtils from '../../../engine/core/canvasUtils.js';
import CanvasText from '../../../engine/core/canvasText.js';
import PrimitiveRenderer from '../../../engine/renderers/primitiveRenderer.js';
import { canvasConfig, gameUi, safeAreaInset } from './global.js';

export function renderScreen(screen) {
    drawStyledStage(screen.panelColor, screen.borderColor);
    screen.lines.forEach(({ text, y, ...options }) => {
        renderCenteredText(text, y, options);
    });
}

export function renderPlayerSelectOptions(screen, config, gameControllers = null) {
    const lines = gameControllers
        ? [...screen.options.lines, ...screen.options.controllerLines]
        : screen.options.lines;

    renderCenteredMultilineText(lines, config.y + config.spacing, {
        fontSize: screen.options.fontSize,
        lineHeight: screen.options.lineHeight,
        fontFamily: screen.options.fontFamily,
        color: screen.options.color
    });
}

export function renderPlayScreen(screen, playerInfo) {
    drawStyledStage(screen.panelColor, screen.borderColor);
    renderCenteredText(playerInfo, screen.infoY, {
        fontSize: screen.infoFontSize,
        fontFamily: screen.infoFontFamily,
        color: screen.infoColor
    });
    renderCenteredMultilineText(screen.prompts, screen.promptsY, {
        fontSize: screen.promptFontSize,
        lineHeight: screen.promptLineHeight,
        fontFamily: screen.promptFontFamily,
        color: screen.promptColor
    });
}

function drawStyledStage(panelColor = gameUi.theme.colors.panel, borderColor = gameUi.theme.colors.accent) {
    const { panelX, panelY, panelWidth, panelHeight, panelBorderSize } = gameUi.theme;

    const inset = 16;
    const headerOffsetY = 70;
    PrimitiveRenderer.drawPanel(panelX, panelY, panelWidth, panelHeight, {
        fillColor: panelColor,
        borderColor,
        borderWidth: panelBorderSize,
        backdropColor: gameUi.theme.colors.panelBackdrop,
        backdropInset: inset,
        headerY: panelY + headerOffsetY,
        headerColor: borderColor,
        headerWidth: 2
    });
    drawPulseAccent(panelX, panelY + headerOffsetY + 6, panelWidth, gameUi.theme.colors.accent);
    PrimitiveRenderer.drawSafeAreaGuides(
        canvasConfig.width,
        canvasConfig.height,
        safeAreaInset,
        `${gameUi.theme.colors.accent}99`
    );
}

function drawPulseAccent(x, y, width, accentColor) {
    const pulse = (Math.sin(Date.now() * 0.004) + 1) / 2;
    const alpha = 0.25 + (pulse * 0.45);
    const alphaHex = Math.round(alpha * 255).toString(16).padStart(2, '0');
    const colorWithAlpha = accentColor.length === 7 ? `${accentColor}${alphaHex}` : accentColor;
    PrimitiveRenderer.drawLine(x + 24, y, x + width - 24, y, colorWithAlpha, 3);
}

function renderCenteredText(text, y, options = {}) {
    return CanvasText.renderCenteredText(CanvasUtils.ctx, text, y, {
        ...options
    });
}

function renderCenteredMultilineText(lines, startY, options = {}) {
    return CanvasText.renderCenteredMultilineText(CanvasUtils.ctx, lines, startY, {
        ...options
    });
}


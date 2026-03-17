// ToolboxAid.com
// David Quesenberry
// celestialBodyRender.js
// 03/15/2026

import { canvasConfig, solarSystemConfig, uiFont } from './global.js';
import CanvasText from '../../../engine/core/canvasText.js';
import PrimitiveRenderer from '../../../engine/renderers/primitiveRenderer.js';

function getSystemCenter() {
    return {
        x: canvasConfig.width / 2,
        y: canvasConfig.height / 2
    };
}

function drawOrbit(centerX, centerY, distance, zoom) {
    PrimitiveRenderer.drawCircle(centerX, centerY, distance * zoom, null, solarSystemConfig.display.orbitStroke, 1, 1, {
        lineDash: [10, 15]
    });
}

function drawRing(drawX, drawY, ring, zoom) {
    PrimitiveRenderer.drawEllipse(
        drawX,
        drawY,
        ring.ringRadius * zoom,
        ring.ringRadius * zoom,
        ring.color,
        null,
        0,
        0,
        1
    );
}

function drawMoons(moons, centerX, centerY, zoom) {
    moons.forEach((moon) => {
        PrimitiveRenderer.drawCircle(
            centerX + (moon.x * zoom),
            centerY + (moon.y * zoom),
            moon.visual.radius * zoom,
            moon.visual.color,
            null,
            0,
            1
        );
    });
}

function drawLabel(name, drawX, drawY, scaledRadius, zoom) {
    CanvasText.renderText(name, drawX + scaledRadius + 6, drawY - scaledRadius - 4, {
        fontSize: Math.max(12, Math.round(14 * zoom)),
        fontFamily: uiFont.ui,
        color: solarSystemConfig.display.labelColor,
        useDpr: false
    });
}

export function drawCelestialBody(body, {
    centerX = getSystemCenter().x,
    centerY = getSystemCenter().y,
    zoom = 1,
    showOrbits = true,
    showLabels = false
} = {}) {
    const scaledRadius = body.visual.radius * zoom;
    const drawX = centerX + (body.x * zoom);
    const drawY = centerY + (body.y * zoom);

    if (showOrbits) {
        drawOrbit(centerX, centerY, body.orbit.distance, zoom);
    }

    if (body.visual.ring) {
        drawRing(drawX, drawY, body.visual.ring, zoom);
    }

    PrimitiveRenderer.drawCircle(drawX, drawY, scaledRadius, body.visual.color, null, 0, 1);

    drawMoons(body.moons, centerX, centerY, zoom);

    if (showLabels) {
        drawLabel(body.name, drawX, drawY, scaledRadius, zoom);
    }
}


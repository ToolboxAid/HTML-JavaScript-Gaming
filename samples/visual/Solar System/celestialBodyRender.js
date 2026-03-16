// ToolboxAid.com
// David Quesenberry
// celestialBodyRender.js
// 03/15/2026

import { canvasConfig, solarSystemConfig, uiFont } from './global.js';
import CanvasUtils from '../../../engine/core/canvasUtils.js';
import PrimitiveRenderer from '../../../engine/renderers/primitiveRenderer.js';

function getSystemCenter() {
    return {
        x: canvasConfig.width / 2,
        y: canvasConfig.height / 2
    };
}

function drawOrbit(ctx, centerX, centerY, distance, zoom) {
    PrimitiveRenderer.drawCircle(centerX, centerY, distance * zoom, null, solarSystemConfig.display.orbitStroke, 1, 1, {
        ctx,
        lineDash: [10, 15]
    });
}

function drawRing(ctx, drawX, drawY, ring, zoom) {
    PrimitiveRenderer.drawEllipse(
        drawX,
        drawY,
        ring.ringRadius * zoom,
        ring.ringRadius * zoom,
        ring.color,
        null,
        0,
        0,
        1,
        { ctx }
    );
}

function drawMoons(ctx, moons, centerX, centerY, zoom) {
    moons.forEach((moon) => {
        PrimitiveRenderer.drawCircle(
            centerX + (moon.x * zoom),
            centerY + (moon.y * zoom),
            moon.visual.radius * zoom,
            moon.visual.color,
            null,
            0,
            1,
            { ctx }
        );
    });
}

function drawLabel(ctx, name, drawX, drawY, scaledRadius, zoom) {
    ctx.fillStyle = solarSystemConfig.display.labelColor;
    ctx.font = `${Math.max(12, Math.round(14 * zoom))}px ${uiFont.ui}`;
    ctx.fillText(name, drawX + scaledRadius + 6, drawY - scaledRadius - 4);
}

export function drawCelestialBody(body, {
    centerX = getSystemCenter().x,
    centerY = getSystemCenter().y,
    zoom = 1,
    showOrbits = true,
    showLabels = false
} = {}) {
    const ctx = CanvasUtils.ctx;
    const scaledRadius = body.visual.radius * zoom;
    const drawX = centerX + (body.x * zoom);
    const drawY = centerY + (body.y * zoom);

    if (showOrbits) {
        drawOrbit(ctx, centerX, centerY, body.orbit.distance, zoom);
    }

    if (body.visual.ring) {
        drawRing(ctx, drawX, drawY, body.visual.ring, zoom);
    }

    PrimitiveRenderer.drawCircle(drawX, drawY, scaledRadius, body.visual.color, null, 0, 1, { ctx });

    drawMoons(ctx, body.moons, centerX, centerY, zoom);

    if (showLabels) {
        drawLabel(ctx, body.name, drawX, drawY, scaledRadius, zoom);
    }
}


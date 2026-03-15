// ToolboxAid.com
// David Quesenberry
// celestialBodyHelpers.js
// 03/15/2026

import { canvasConfig, solarSystemConfig, uiFont } from './global.js';
import CanvasUtils from '../../../engine/core/canvas.js';

export function createMoon(moon) {
    return {
        x: 0,
        y: 0,
        visual: {
            radius: moon.radius,
            color: solarSystemConfig.display.moonColor
        },
        orbit: {
            distance: moon.distance,
            angle: moon.angle,
            speed: moon.speed
        }
    };
}

export function updatePositionFromOrbit(body) {
    body.x = body.orbit.distance * Math.cos(body.orbit.angle);
    body.y = body.orbit.distance * Math.sin(body.orbit.angle);
}

export function updateMoons(body, deltaTime) {
    body.moons.forEach((moon) => {
        moon.orbit.angle += moon.orbit.speed * deltaTime;
        moon.x = body.x + moon.orbit.distance * Math.cos(moon.orbit.angle);
        moon.y = body.y + moon.orbit.distance * Math.sin(moon.orbit.angle);
    });
}

function getSystemCenter() {
    return {
        x: canvasConfig.width / 2,
        y: canvasConfig.height / 2
    };
}

function drawOrbit(ctx, centerX, centerY, distance, zoom) {
    ctx.beginPath();
    ctx.arc(centerX, centerY, distance * zoom, 0, Math.PI * 2);
    ctx.strokeStyle = solarSystemConfig.display.orbitStroke;
    ctx.lineWidth = 1;
    ctx.setLineDash([10, 15]);
    ctx.stroke();
    ctx.closePath();
}

function drawRing(ctx, drawX, drawY, ring, zoom) {
    ctx.beginPath();
    ctx.ellipse(drawX, drawY, ring.ringRadius * zoom, ring.ringRadius * zoom, 0, 0, Math.PI * 2);
    ctx.fillStyle = ring.color;
    ctx.fill();
    ctx.closePath();
}

function drawMoons(ctx, moons, centerX, centerY, zoom) {
    moons.forEach((moon) => {
        ctx.beginPath();
        ctx.arc(
            centerX + (moon.x * zoom),
            centerY + (moon.y * zoom),
            moon.visual.radius * zoom,
            0,
            Math.PI * 2
        );
        ctx.fillStyle = moon.visual.color;
        ctx.fill();
        ctx.closePath();
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

    ctx.setLineDash([0, 0]);

    if (body.visual.ring) {
        drawRing(ctx, drawX, drawY, body.visual.ring, zoom);
    }

    ctx.beginPath();
    ctx.arc(drawX, drawY, scaledRadius, 0, Math.PI * 2);
    ctx.fillStyle = body.visual.color;
    ctx.fill();
    ctx.closePath();

    drawMoons(ctx, body.moons, centerX, centerY, zoom);

    if (showLabels) {
        drawLabel(ctx, body.name, drawX, drawY, scaledRadius, zoom);
    }
}

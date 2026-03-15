// ToolboxAid.com
// David Quesenberry
// 10/16/2024
// celestialBody.js

import { canvasConfig, solarSystemConfig, uiFont } from './global.js';
import CanvasUtils from '../../../engine/core/canvas.js';
import ObjectStatic from '../../../engine/objects/objectStatic.js';

function createMoon(moon) {
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

function getSystemCenter() {
    return {
        x: canvasConfig.width / 2,
        y: canvasConfig.height / 2
    };
}

function updatePositionFromOrbit(body) {
    body.x = body.orbit.distance * Math.cos(body.orbit.angle);
    body.y = body.orbit.distance * Math.sin(body.orbit.angle);
}

function updateMoons(body, deltaTime) {
    body.moons.forEach((moon) => {
        moon.orbit.angle += moon.orbit.speed * deltaTime;
        moon.x = body.x + moon.orbit.distance * Math.cos(moon.orbit.angle);
        moon.y = body.y + moon.orbit.distance * Math.sin(moon.orbit.angle);
    });
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

/**
 * Represents a celestial body in a solar system, such as a planet or star/sun.
 */
class CelestialBody extends ObjectStatic {

    /**
     * Creates an instance of CelestialBody.
     */
    constructor(name, radius, distance, color, angle, speed, moons = [], ring = null) {
        const x = distance * Math.cos(angle);
        const y = distance * Math.sin(angle);

        super(x, y, radius * 2, radius * 2);

        this.name = name;
        this.type = 'celestialBody';
        this.visual = {
            radius,
            color,
            ring
        };
        this.orbit = {
            distance,
            angle,
            speed
        };
        this.moons = moons.map(createMoon);

        updatePositionFromOrbit(this);
        updateMoons(this, 0);
    }

    update(deltaTime) {
        this.orbit.angle += this.orbit.speed * deltaTime;
        updatePositionFromOrbit(this);
        updateMoons(this, deltaTime);
    }

    draw({
        centerX = getSystemCenter().x,
        centerY = getSystemCenter().y,
        zoom = 1,
        showOrbits = true,
        showLabels = false
    } = {}) {
        const ctx = CanvasUtils.ctx;
        const scaledRadius = this.visual.radius * zoom;
        const drawX = centerX + (this.x * zoom);
        const drawY = centerY + (this.y * zoom);

        if (showOrbits) {
            drawOrbit(ctx, centerX, centerY, this.orbit.distance, zoom);
        }

        ctx.setLineDash([0, 0]);

        if (this.visual.ring) {
            drawRing(ctx, drawX, drawY, this.visual.ring, zoom);
        }

        ctx.beginPath();
        ctx.arc(drawX, drawY, scaledRadius, 0, Math.PI * 2);
        ctx.fillStyle = this.visual.color;
        ctx.fill();
        ctx.closePath();

        drawMoons(ctx, this.moons, centerX, centerY, zoom);

        if (showLabels) {
            drawLabel(ctx, this.name, drawX, drawY, scaledRadius, zoom);
        }
    }
}

export default CelestialBody; // Export the class for use in other modules



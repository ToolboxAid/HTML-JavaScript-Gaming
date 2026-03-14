// ToolboxAid.com
// David Quesenberry
// 10/16/2024
// celestialBody.js

import { canvasConfig, solarSystemConfig } from './global.js';
import CanvasUtils from '../../engine/core/canvas.js';
import ObjectStatic from '../../engine/objects/objectStatic.js';

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
        this.moons = moons.map((moon) => ({
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
        }));

        this.updatePositionFromOrbit();
        this.updateMoons(0);
    }

    get radius() {
        return this.visual.radius;
    }

    get color() {
        return this.visual.color;
    }

    get ring() {
        return this.visual.ring;
    }

    get distance() {
        return this.orbit.distance;
    }

    get angle() {
        return this.orbit.angle;
    }

    set angle(value) {
        this.orbit.angle = value;
    }

    get speed() {
        return this.orbit.speed;
    }

    getSystemCenter() {
        return {
            x: canvasConfig.width / 2,
            y: canvasConfig.height / 2
        };
    }

    updatePositionFromOrbit() {
        this.x = this.orbit.distance * Math.cos(this.orbit.angle);
        this.y = this.orbit.distance * Math.sin(this.orbit.angle);
    }

    updateMoons(deltaTime) {
        this.moons.forEach((moon) => {
            moon.orbit.angle += moon.orbit.speed * deltaTime;
            moon.x = this.x + moon.orbit.distance * Math.cos(moon.orbit.angle);
            moon.y = this.y + moon.orbit.distance * Math.sin(moon.orbit.angle);
        });
    }

    update(deltaTime) {
        this.orbit.angle += this.orbit.speed * deltaTime;
        this.updatePositionFromOrbit();
        this.updateMoons(deltaTime);
    }

    draw({
        centerX = this.getSystemCenter().x,
        centerY = this.getSystemCenter().y,
        zoom = 1,
        showOrbits = true,
        showLabels = false
    } = {}) {
        const ctx = CanvasUtils.ctx;
        const scaledRadius = this.radius * zoom;
        const drawX = centerX + (this.x * zoom);
        const drawY = centerY + (this.y * zoom);

        if (showOrbits) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, this.orbit.distance * zoom, 0, Math.PI * 2);
            ctx.strokeStyle = solarSystemConfig.display.orbitStroke;
            ctx.lineWidth = 1;
            ctx.setLineDash([10, 15]);
            ctx.stroke();
            ctx.closePath();
        }

        ctx.setLineDash([0, 0]);

        if (this.ring) {
            ctx.beginPath();
            ctx.ellipse(drawX, drawY, this.ring.ringRadius * zoom, this.ring.ringRadius * zoom, 0, 0, Math.PI * 2);
            ctx.fillStyle = this.ring.color;
            ctx.fill();
            ctx.closePath();
        }

        ctx.beginPath();
        ctx.arc(drawX, drawY, scaledRadius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();

        this.moons.forEach(moon => {
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

        if (showLabels) {
            ctx.fillStyle = solarSystemConfig.display.labelColor;
            ctx.font = `${Math.max(12, Math.round(14 * zoom))}px Arial`;
            ctx.fillText(this.name, drawX + scaledRadius + 6, drawY - scaledRadius - 4);
        }
    }

}

export default CelestialBody; // Export the class for use in other modules


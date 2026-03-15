// ToolboxAid.com
// David Quesenberry
// celestialBodyState.js
// 03/15/2026

import { solarSystemConfig } from './global.js';

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

function createBodyVisual(radius, color, ring) {
    return { radius, color, ring };
}

function createBodyOrbit(distance, angle, speed) {
    return { distance, angle, speed };
}

export function getInitialBodyPosition(distance, angle) {
    return {
        x: distance * Math.cos(angle),
        y: distance * Math.sin(angle)
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

export function initializeCelestialBody(body, { radius, color, ring, distance, angle, speed, moons }) {
    body.visual = createBodyVisual(radius, color, ring);
    body.orbit = createBodyOrbit(distance, angle, speed);
    body.moons = moons.map(createMoon);
    updatePositionFromOrbit(body);
    updateMoons(body, 0);
}

export function updateCelestialBody(body, deltaTime) {
    body.orbit.angle += body.orbit.speed * deltaTime;
    updatePositionFromOrbit(body);
    updateMoons(body, deltaTime);
}

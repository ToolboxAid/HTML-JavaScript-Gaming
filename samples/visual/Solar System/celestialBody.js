// ToolboxAid.com
// David Quesenberry
// 10/16/2024
// celestialBody.js

import ObjectStatic from '../../../engine/objects/objectStatic.js';
import {
    drawCelestialBody,
    getInitialBodyPosition,
    initializeCelestialBody,
    updateCelestialBody
} from './celestialBodyHelpers.js';

/**
 * Represents a celestial body in a solar system, such as a planet or star/sun.
 */
class CelestialBody extends ObjectStatic {

    /**
     * Creates an instance of CelestialBody.
     */
    constructor(name, radius, distance, color, angle, speed, moons = [], ring = null) {
        const { x, y } = getInitialBodyPosition(distance, angle);

        super(x, y, radius * 2, radius * 2);

        this.name = name;
        this.type = 'celestialBody';
        initializeCelestialBody(this, { radius, color, ring, distance, angle, speed, moons });
    }

    update(deltaTime) {
        updateCelestialBody(this, deltaTime);
    }

    draw(renderOptions = {}) {
        drawCelestialBody(this, renderOptions);
    }
}

export default CelestialBody; // Export the class for use in other modules



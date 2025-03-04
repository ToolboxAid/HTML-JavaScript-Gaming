// ToolboxAid.com
// David Quesenberry
// 10/16/2024
// celestialBody.js

import { canvasConfig } from './global.js'; // Import canvasConfig
import CanvasUtils from '../scripts/canvas.js';
import ObjectDynamic from '../scripts/objectDynamic.js'; // Import ObjectDynamic

/**
 * Represents a celestial body in a solar system, such as a planet or star/sun.
 */
class CelestialBody extends ObjectDynamic {

    /**
     * Creates an instance of CelestialBody.
     * @param {string} name - The name of the celestial body.
     * @param {number} radius - The radius of the celestial body.
     * @param {number} distance - The distance from the sun (or central body).
     * @param {string} color - The color of the celestial body.
     * @param {number} angle - The initial angle in radians for orbital position.
     * @param {number} speed - The speed of the celestial body in its orbit.
     * @param {Array} moons - An array of moons, each represented as an object.
     * @param {Object} [ring=null] - An optional ring object containing radius, and color.
     */
    constructor(name, radius, distance, color, angle, speed, moons = [], ring = null) {
        // Calculate initial position based on distance and angle
        let x = distance * Math.cos(angle);
        let y = distance * Math.sin(angle);

        super(x, y, radius * 2, radius * 2, speed * Math.cos(angle), speed * Math.sin(angle)); // Call parent constructor
        this.name = name; // Name of the celestial body
        this.radius = radius; // Radius of the celestial body
        this.distance = distance; // Distance from the central body
        this.color = color; // Color of the celestial body
        this.angle = angle; // Current angle in its orbit
        this.speed = speed; // Speed of orbital movement
        this.moons = moons; // Array of moons
        this.ring = ring; // Optional ring properties
    }

    /**
     * Updates the position of the celestial body in its orbit.
     * @param {number} deltaTime - The time elapsed since the last update, in seconds.
     */
    update(deltaTime) {
        // Update the angle of the planet based on its speed
        this.angle += this.speed * deltaTime;

        // Update the planet's position based on the angle and distance from the center
        this.x = this.distance * Math.cos(this.angle);
        this.y = this.distance * Math.sin(this.angle);

        // Update the position of each moon relative to the planet, and rotate the moons around the planet
        this.moons.forEach(moon => {
            //deltaTime = 1;
            moon.angle += moon.speed * deltaTime; // Update the moon's angle based on its speed
            moon.x = this.x + moon.distance * Math.cos(moon.angle); // Moon's position relative to the planet
            moon.y = this.y + moon.distance * Math.sin(moon.angle); // Moon's position relative to the planet
        });

        // Call the parent class's update function (if necessary)
        super.update(deltaTime);
    }

    draw() {
        const ctx = CanvasUtils.ctx;
        // order matters, draw orbits, rings, bodies, moons
        const centerX = canvasConfig.width / 2;
        const centerY = canvasConfig.height / 2;

        // Draw the orbit path for the planet
        ctx.beginPath();
        ctx.arc(centerX, centerY, this.distance, 0, Math.PI * 2); // Orbit path is a circle with radius equal to distance from center
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)'; // Light color for the orbit path (adjust transparency if needed)
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 20]); // Set the line dash pattern
        ctx.stroke();
        ctx.closePath();

        ctx.setLineDash([0, 0]); // reset dashes:

        // Draw rings if they exist
        if (this.ring) {
            ctx.beginPath();
            ctx.ellipse(this.x + centerX, this.y + centerY, this.ring.ringRadius, this.ring.ringRadius, 0, 0, Math.PI * 2);
            ctx.fillStyle = this.ring.color;
            ctx.fill();
            ctx.closePath();
        }

        // Draw the celestial body
        ctx.beginPath();
        ctx.arc(this.x + centerX, this.y + centerY, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();

        // Draw each moon orbiting around the planet
        this.moons.forEach(moon => {
            ctx.beginPath();
            ctx.arc(moon.x + centerX, moon.y + centerY, moon.radius, 0, Math.PI * 2);
            ctx.fillStyle = "white"; // Assuming moons are white for simplicity
            ctx.fill();
            ctx.closePath();
        });
    }

}

export default CelestialBody; // Export the class for use in other modules

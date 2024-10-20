// ToolboxAid.com
// David Quesenberry
// 10/16/2024
// celestialBody.js

import { canvasConfig} from './global.js'; // Import canvasConfig
import ObjectDynamic from '../scripts/objectDynamic.js'; // Import ObjectDynamic
import CanvasUtils from '../scripts/canvas.js'; // shows as unused, but it is required.

/**
 * Represents a celestial body in a solar system, such as a planet or star.
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
     * @param {Object} [ring=null] - An optional ring object containing outerRadius, innerRadius, and color.
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

        if (this.name.trim().toLowerCase() === "sun") {
            this.x = 512;
            this.y = 512;
            console.log(this.name);
        }
    }

    /**
     * Updates the position of the celestial body in its orbit.
     * @param {number} deltaTime - The time elapsed since the last update, in seconds.
     */
    update(deltaTime) {
        // Update the angle based on speed and delta time
        this.angle += this.speed * deltaTime;
    
        // Update position based on distance and angle
        this.x = this.distance * Math.cos(this.angle);
        this.y = this.distance * Math.sin(this.angle);
    
        // Log the new position
       // console.log(`New position: x = ${this.x}, y = ${this.y}`);
        
        // Call parent update to adjust position based on velocity
        super.update(deltaTime);
    }
    

    /**
     * Draws the celestial body on the canvas.
     * @param {CanvasRenderingContext2D} ctx - The drawing context.
     */
    draw(ctx) {
        const centerX = canvasConfig.width / 2;
        const centerY = canvasConfig.height / 2;
        // Draw the celestial body
        ctx.beginPath();
        ctx.arc(this.x + centerX, this.y + centerY, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();

        //CanvasUtils.drawLine(ctx, 400, 400, 800, 800, 5, "yellow");

        // Draw rings if they exist
        if (this.ring) {
            ctx.beginPath();
            ctx.ellipse(this.x + centerX, this.y + centerY, this.ring.outerRadius, this.ring.innerRadius, 0, 0, Math.PI * 2);
            ctx.fillStyle = this.ring.color;
            ctx.fill();
            ctx.closePath();
        }

        // Draw moons if they exist
        this.moons.forEach(moon => {
            ctx.beginPath();
            ctx.arc(this.x + centerX + moon.distance * Math.cos(moon.angle), this.y + centerY + moon.distance * Math.sin(moon.angle), moon.radius, 0, Math.PI * 2);
            ctx.fillStyle = "white"; // Assuming moons are white for simplicity
            ctx.fill();
            ctx.closePath();
        });
    }
}

export default CelestialBody; // Export the class for use in other modules

// ToolboxAid.com
// David Quesenberry
// 11/19/2024
// particleExplosion.js

import CanvasUtils from "../canvas.js";
import SystemUtils from "../utils/systemUtils.js";

class ParticleExplosion {

    // Enable debug mode: game.html?particleExplosion
    static DEBUG = new URLSearchParams(window.location.search).has('particleExplosion');

    constructor(x, y, startRadius, endRadius, duration, particleCount, particleRadius = 3.0) {
        this.x = x;
        this.y = y;
        this.startRadius = startRadius; // Explosion start radius
        this.endRadius = endRadius; // Explosion end radius
        this.duration = duration; // Time to live duration
        this.particleCount = particleCount; // Count of particals
        this.particleRadius = particleRadius; // inital size for particles
        this.particles = []; // array list containing particals
        this.elapsedTime = 0; // elapsed time since created
        this.isDone = false; // animation is complete
        this.createParticles();
    }

    createParticles() {
        const angleStep = (Math.PI * 2) / this.particleCount;

        for (let i = 0; i < this.particleCount; i++) {
            const angle = angleStep * i;

            // Calculate initial draw adius first
            const drawRadius = (Math.random() * 0.8 + 0.2) * this.particleRadius;

            this.particles.push({
                angle: angle + (Math.random() * 0.2 - 0.1), // Slight angle variation
                x: this.x,
                y: this.y,
                alpha: 1.0, // transparency
                // speed: Math.random() * 0.8 + 0.6, // Faster initial speed
                speed: Math.random() * 1.0 + 0.3, // Faster initial speed

                drawRadius: drawRadius,
                initDrawRadius: drawRadius,

                travelDistance: 0, // Current distance from explosion center
                maxTravelDistance: this.endRadius * (Math.random() * 0.7 + 0.3), // Max travel distance               

                // Controls how quickly particles slow down as they move outward from the explosion center.
                // speedDecay: Math.random() * 0.2 + 0.85,  // Quick decay (0.85 to 1.05)
                // speedDecay: Math.random() * 0.15 + 0.90, // Medium decay (0.90 to 1.05)
                // speedDecay: Math.random() * 0.1 + 0.95,  // Slow decay (0.95 to 1.05)
                // speedDecay: Math.random() * 0.05 + 0.98, // Much slower decay
                speedDecay: Math.random() * 0.05 + 0.97, // Slower decay (0.97 to 1.02)

                // Controls when particles begin to fade out during their lifecycle.
                // fadeStart: Math.random() * 0.1 + 0.2, // Earlier fade (20-30% of max radius)
                // fadeStart: Math.random() * 0.1 + 0.3, // Earlier fade (30-40% of max radius)
                fadeStart: Math.random() * 0.1 + 0.4, // Earlier fade (40-50% of max radius)
                // fadeStart: Math.random() * 0.1 + 0.5, // Middle fade (50-60% of max radius)
                // fadeStart: Math.random() * 0.1 + 0.6, // Start fading between 60-70% of max radius
                // fadeStart: Math.random() * 0.1 + 0.7, // Later fade (70-80% of max radius)
            });
        }

        // let rads = "";
        // for (let i = 0; i < this.particleCount; i++) {
        //     rads += this.particles[i].radius.toFixed(1) + ", ";
        // }
        // console.log(rads);
    }

    update(deltaTime) {
        if (this.isDone) return true;

        this.elapsedTime += deltaTime;
        const timeProgress = Math.min(this.elapsedTime / this.duration, 1.0);

        let allParticlesDone = true;

        this.particles.forEach(particle => {
            // // Calculate movement - continues throughout entire duration
            // //const speedDelta = particle.speed * deltaTime * 20;
            // // const speedDelta = particle.speed * deltaTime * 25;// Half speed
            // const speedDelta = particle.speed * deltaTime * 50;// regular speed
            // // const speedDelta = particle.speed * deltaTime * 100;// Double speed
            // // const speedDelta = particle.speed * deltaTime * 75;        
            // // const speedDelta = particle.speed * deltaTime * 60;                
            // const newTravelDistance = particle.travelDistance + speedDelta;

            // // Limit travel distance to maxTravelDistance
            // particle.travelDistance = newTravelDistance;

            // // Update particle position using travel distance
            // particle.x = this.x + Math.cos(particle.angle) * particle.travelDistance;
            // particle.y = this.y + Math.sin(particle.angle) * particle.travelDistance;
            // Calculate ideal speed based on maxTravelDistance and duration
            // This ensures particles reach their max distance over the full duration
            const targetSpeed = particle.maxTravelDistance / this.duration;

            // Scale speed based on particle's initial speed variation
            const adjustedSpeed = targetSpeed * particle.speed;

            // Calculate movement delta
            const speedDelta = adjustedSpeed * deltaTime;
            const newTravelDistance = particle.travelDistance + speedDelta;

            // Update travel distance
            particle.travelDistance = Math.min(newTravelDistance, particle.maxTravelDistance);

            // Update particle position using travel distance
            particle.x = this.x + Math.cos(particle.angle) * particle.travelDistance;
            particle.y = this.y + Math.sin(particle.angle) * particle.travelDistance;


// Fade and shrink starts at particle's fadeStart
if (timeProgress >= particle.fadeStart) {
    const fadeProgress = Math.min(1.0, (timeProgress - particle.fadeStart) / (1.0 - particle.fadeStart));
    const fadeAmount = Math.pow(1.0 - fadeProgress, 2.0);
    particle.alpha = Math.max(0, fadeAmount);

    // Reduce visual size during fade
    particle.drawRadius = particle.initDrawRadius * particle.alpha;
}

            // Cleanup check based on time and visibility
            if ((particle.alpha <= 0.01 || timeProgress >= 1.0) && particle.drawRadius < 1) {
                particle.alpha = 0;
                particle.drawRadius = 0;
            } else {
                allParticlesDone = false;
            }
        });

        if (allParticlesDone || timeProgress >= 1.0) {
            this.isDone = true;
            this.particles.forEach(particle => {
                particle.alpha = 0;
                particle.drawRadius = 0;
            });
        }

        return this.isDone;
    }

    static shape = "circle";
    draw() {
        if (this.isDone) return;

        const ctx = CanvasUtils.ctx;

        this.particles.forEach(particle => {
            if (particle.alpha > 0 && particle.drawRadius > 0) {
                if (ParticleExplosion.shape === "circle") {
                    ctx.beginPath();
                    ctx.arc(particle.x, particle.y, particle.drawRadius, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(255, 255, 255, ${particle.alpha})`;
                    ctx.fill();
                } else { // Convert radius to square size (diameter)
                    const size = particle.drawRadius * 2;
                    // Center the square by offsetting by half its size
                    const x = particle.x - particle.drawRadius;
                    const y = particle.y - particle.drawRadius;

                    ctx.fillStyle = `rgba(255, 255, 255, ${particle.alpha})`;
                    ctx.fillRect(x, y, size, size);
                }
            }
        });
    }

    destroy() {
        // Force cleanup of any remaining particles
        this.particles.forEach(particle => {
            // Clear all particle properties
            particle.angle = null;
            particle.x = null;
            particle.y = null;
            particle.alpha = null;
            particle.speed = null;
            particle.drawRadius = null;
            particle.initDrawRadius = null;
            particle.travelDistance = null;
            particle.maxTravelDistance = null;
            particle.speedDecay = null;
            particle.fadeStart = null;
        });

        // Clean up array and reset all instance properties
        SystemUtils.cleanupArray(this.particles);
        this.particles = null;

        // Reset all instance properties in same order as constructor
        this.x = null;
        this.y = null;
        this.startRadius = null;
        this.endRadius = null;
        this.duration = null;
        this.particleCount = null;
        this.particleRadius = null;
        this.elapsedTime = null;
        this.isDone = null;
    }
}

export default ParticleExplosion;
// ToolboxAid.com
// David Quesenberry
// 11/19/2024
// particleExplosion.js

class ParticleExplosion {

    // Enable debug mode: game.html?particleExplosion
    static DEBUG = new URLSearchParams(window.location.search).has('particleExplosion');

    constructor(x, y, startRadius, endRadius, duration, particleCount, particleSize = 0.75) {
        this.x = x;
        this.y = y;
        this.startRadius = startRadius;
        this.endRadius = endRadius;
        this.duration = duration;
        this.particleCount = particleCount;
        this.particles = [];
        this.elapsedTime = 0;
        this.isDone = false;
        this.particleSize = particleSize;
        this.createParticles();
    }

    // createParticles1() {
    //     const angleStep = (Math.PI * 2) / this.particleCount;

    //     for (let i = 0; i < this.particleCount; i++) {
    //         const angle = angleStep * i;
    //         const initialSize = Math.random() * 1.0 + this.particleSize; // Create size once (0.5 to 1.5)
    //         this.particles.push({
    //             angle: angle + (Math.random() * 0.2 - 0.1), // Slight angle variation
    //             x: this.x,
    //             y: this.y,
    //             alpha: 1.0,
    //             speed: Math.random() * 0.8 + 0.6, // Faster initial speed
    //             radius: this.startRadius,
    //             maxRadius: this.endRadius * (Math.random() * 0.4 + 0.8), // Less variation in max radius
    //             speedDecay: Math.random() * 0.05 + 0.97, // Much slower decay
    //             //size: Math.random() * 1.5 + 1.5, // Slightly larger particles
    //             size: initialSize,
    //             initialSize: initialSize, // Store initial size for fade calculations
    //             //fadeStart: Math.random() * 0.3 + 0.6 // Start fading at 60-90% of max radius
    //             fadeStart: Math.random() * 0.1 + 0.6 // Start fading between 60-70% of max radius
    //         });
    //     }
    // }

    createParticles() {
        const angleStep = (Math.PI * 2) / this.particleCount;

        for (let i = 0; i < this.particleCount; i++) {
            const angle = angleStep * i;
            this.particles.push({
                angle: angle + (Math.random() * 0.2 - 0.1), // Slight angle variation
                x: this.x,
                y: this.y,
                alpha: 1.0,
                speed: Math.random() * 0.8 + 0.6, // Faster initial speed
                radius: this.startRadius,
                maxRadius: this.endRadius * (Math.random() * 0.4 + 0.8), // Less variation in max radius
                speedDecay: Math.random() * 0.05 + 0.97, // Much slower decay
                size: Math.random() * 1.0 + this.particleSize, // Slightly larger particles
                fadeStart: Math.random() * 0.1 + 0.6 // Start fading between 60-70% of max radius
            });
        }
    }

    update(deltaTime) {
        if (this.isDone) return true;

        this.elapsedTime += deltaTime;
        const progress = Math.min(this.elapsedTime / this.duration, 1.0);

        let allParticlesDone = true;

        this.particles.forEach(particle => {
            const speedDelta = particle.speed * deltaTime * 50;
            const currentRadius = particle.radius + speedDelta;
            particle.radius = currentRadius;

            particle.x = this.x + Math.cos(particle.angle) * currentRadius;
            particle.y = this.y + Math.sin(particle.angle) * currentRadius;

            // Calculate radius percentage
            const radiusPercent = currentRadius / particle.maxRadius;

            // Fade out between 60-100% of max radius
            const percent = 0.6;
            if (radiusPercent >= percent) {
                const fadeProgress = (radiusPercent - percent) / 0.2; // normalize to 0-1 range
                particle.alpha = Math.max(0, 1.0 - fadeProgress);
                // Reduce particle size proportionally with alpha
                particle.size = particle.size * particle.alpha;
            }

            particle.speed *= Math.pow(particle.speedDecay, deltaTime * 30);

            // Changed condition to check if particle is still active
            // if (particle.alpha > 0.01 && currentRadius < particle.maxRadius) {
            if (particle.alpha > 0.01 && currentRadius > 0.05) {
                allParticlesDone = false;
            }
        });

        // Changed condition to use OR instead of AND
        if (allParticlesDone || progress >= 1.05) {
            this.isDone = true;
            // Force cleanup of any remaining particles
            this.particles.forEach(particle => {
                particle.alpha = 0;
                particle.size = 0;
            });
        }

        return this.isDone;
    }

    draw() {
        if (this.isDone) return;

        const ctx = document.querySelector('canvas').getContext('2d');

        this.particles.forEach(particle => {
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${particle.alpha})`;
            ctx.fill();
        });
    }

    destroy() {
        this.particles = [];
        this.elapsedTime = 0;
        this.isDone = true;
    }
}

export default ParticleExplosion;
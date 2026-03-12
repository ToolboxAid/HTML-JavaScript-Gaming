import ParticleExplosion from '../gfx/particleExplosion.js';

class CanExplode {

    // Enable debug mode: game.html?canExplode
    static DEBUG = new URLSearchParams(window.location.search).has('canExplode');

    constructor() {
        this.explosions = [];
        this.lastExplosionTime = 0;
        this.EXPLOSION_INTERVAL = 500; // 0.5 seconds in milliseconds
    }

    newParticleExplosion(x, y, radius, particleRadius = 3.5) {
        const explosion = new ParticleExplosion(
            x,               // x position
            y,               // y position
            0,               // start radius
            radius,          // end radius
            1.0,             // duration in seconds
            radius / 4,      // number of particles
            particleRadius,  // Particle Radius
        );

        this.explosions.push(explosion);

        if (CanExplode.DEBUG) {
            console.log(`explosion:${JSON.stringify(explosion)}`);
        }
    }

    createExplosion(object) {
        this.newParticleExplosion(
            object.x,
            object.y,
            object.explosionRadius,
            1.5
        );

        if (CanExplode.DEBUG) {
            console.log(`CanExplode.explosions:
                ${JSON.stringify(object.x)}
                ${JSON.stringify(object.y)}
                ${JSON.stringify(object.size)}
                ${JSON.stringify(this.explosions)}`);
        }
    }

    hasActiveExplosions() {
        return this.explosions.length;
    }

    updateParticleExplosion(deltaTime) {
        this.explosions = this.explosions.filter(explosion => {
            if (!explosion || explosion.isDone) {
                if (explosion) {
                    explosion.destroy();
                }
                return false;
            }

            if (explosion.update(deltaTime)) {
                explosion.destroy();
                return false;
            }
            explosion.draw();
            return true;
        });
    }

}

export default CanExplode;

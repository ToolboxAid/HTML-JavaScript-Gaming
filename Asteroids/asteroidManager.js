// ToolboxAid.com
// David Quesenberry
// 11/19/2024
// asteroidManager.js

import { canvasConfig } from './global.js';
import Asteroid from './asteroid.js';
import AngleUtils from '../scripts/math/angleUtils.js';
import CollisionUtils from '../scripts/physics/collisionUtils.js';
import GeometryUtils from '../scripts/math/geometryUtils.js';
import RandomUtils from '../scripts/math/randomUtils.js';
import SystemUtils from '../scripts/utils/systemUtils.js';

import ParticleExplosion from '../scripts/gfx/particleExplosion.js';

class AsteroidManager {
    // Enable debug mode: game.html?asteroidManager
    static DEBUG = new URLSearchParams(window.location.search).has('asteroidManager');

    static audioPlayer = null;
    constructor(audioPlayer) {
        this.asteroids = new Map();
        this.asteroidID = 0;
        this.level = 1;
        this.initAsteroids();

        AsteroidManager.audioPlayer = audioPlayer;
    }

    getLevel() {
        return this.level;
    }

    initAsteroids() {
        const maxAsteroids = 3 + (this.level * 2);
        const angleStep = 360 / maxAsteroids;

        for (let i = 0; i < maxAsteroids; i++) {
            const angle = angleStep * i;
            const minDistance = canvasConfig.width / 4;
            const maxDistance = canvasConfig.width / 3;
            const distance = RandomUtils.randomRange(minDistance, maxDistance);
            const position = AngleUtils.calculateOrbitalPosition(
                canvasConfig.width / 2,
                canvasConfig.height / 2,
                angle,
                distance
            );

            this.createAsteroid(position.x, position.y, "large");
        }
    }

    // Create an explosion when an asteroid is hit
    static explosions = [];
    static lastExplosionTime = 0;
    static EXPLOSION_INTERVAL = 500; // 5 seconds in milliseconds

    // Test: Create new explosion every 0.5 seconds
    static newParticleExplosion(x, y, radius, particleRadius = 3.5) {
        const explosion = new ParticleExplosion(
            x,               // x position
            y,               // y position
            0,               // start radius
            radius,          // end radius
            1.0,             // duration in seconds
            radius / 4,      // number of particles
            particleRadius,  // Particle Radius
        );

        AsteroidManager.explosions.push(explosion);

        if (AsteroidManager.DEBUG) {
            console.log(`explosion:${JSON.stringify(explosion)}`);
        }
    }

    createExplosion(object) {
        AsteroidManager.newParticleExplosion(
            object.x,
            object.y,
            object.explosionRadius,
            1.5
        );

        if (AsteroidManager.DEBUG) {
            console.log(`AsteroidManager.explosions:
                ${JSON.stringify(object.x)}
                ${JSON.stringify(object.y)}
                ${JSON.stringify(object.size)}
                ${JSON.stringify(AsteroidManager.explosions)}`
            );
        }
    }

    hasActiveExplosions() {
        return AsteroidManager.explosions.length;
    }


    updateParticleExplosion(deltaTime) {
        AsteroidManager.explosions = AsteroidManager.explosions.filter(explosion => {
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

    createAsteroid(x, y, size) {
        const key = `${size}-${this.asteroidID++}`;
        const asteroid = new Asteroid(x, y, size);
        this.asteroids.set(key, asteroid);
    }

    update(deltaTime) {
        this.asteroids.forEach(asteroid => asteroid.update(deltaTime));

        if (this.asteroids.size === 0) {
            this.level++;
            this.initAsteroids();
        }
        this.updateParticleExplosion(deltaTime);
    }

    draw() {
        this.asteroids.forEach(asteroid => asteroid.draw());
    }

    safeSpawn(ship) {
        const SAFE_DISTANCE = 200;
        let isSafe = true;

        this.asteroids.forEach(asteroid => {
            if (GeometryUtils.getDistanceObjects(ship, asteroid) < SAFE_DISTANCE) {
                isSafe = false;
            }
        });
        console.log("#########################isSafe:", isSafe);
        return isSafe;
    }

    checkShip(ship) {
        if (ship && ship.isAlive()) {
            this.asteroids.forEach((asteroid, asteroidKey) => {
                if (CollisionUtils.vectorCollisionDetection(ship, asteroid)) {
                    if (AsteroidManager.DEBUG) {
                        console.log("Ship hit:", { ship, asteroid, asteroidKey });
                    }
                    ship.setIsDying();
                    this.createExplosion(ship);
                }
            });
        }
    }

    // checkUFO(ufo) {
    //     if (this.ufo && this.ufo.isAlive()) {
    //         if (AsteroidManager.DEBUG) {
    //             console.log("UFO update", "ufoTimer.getProgress", this.ufo, this.ufoTimer.getProgress(), this.ufoTimer);
    //         }

    //         this.asteroids.forEach((asteroid, asteroidKey) => {
    //             if (CollisionUtils.vectorCollisionDetection(ufo, asteroid)) {
    //                 this.setAsteroidHit(asteroid, asteroidKey);
    //                 ufo.setIsDying();

    //                 if (AsteroidManager.DEBUG) {
    //                     console.log("UFO hit asteroid");
    //                 }
    //             }
    //         });
    //     }
    // }

    checkBullet(bullet) {
        let score = 0;
        this.asteroids.forEach((asteroid, asteroidKey) => {
            if (bullet.collisionDetection(asteroid)) {
                bullet.setIsDead();

                this.createExplosion(asteroid);

                if (AsteroidManager.DEBUG) {
                    console.log(`Bullet hit asteroid: \n
                        Bullet: ${JSON.stringify(bullet)} \n
                        Asteroird: ${JSON.stringify(asteroid)} \n`);
                }

                score = this.setAsteroidHit(asteroid, asteroidKey);
            }
        });
        return score;
    }

    setAsteroidHit(asteroid, asteroidKey) {
        if (!asteroid || !asteroidKey || !this.asteroids.has(asteroidKey)) {
            console.error('Invalid asteroid or key:', asteroidKey);
            return 0;
        }

        let score = 0;
        switch (asteroid.size) {
            case 'large':
                this.createAsteroid(asteroid.x, asteroid.y, 'medium');
                this.createAsteroid(asteroid.x, asteroid.y, 'medium');
                score = 100;
                AsteroidManager.audioPlayer.playAudio('bangLarge.wav', 0.5); // 50% volume

                this.createExplosion(asteroid);

                break;
            case 'medium':
                this.createAsteroid(asteroid.x, asteroid.y, 'small');
                this.createAsteroid(asteroid.x, asteroid.y, 'small');
                AsteroidManager.audioPlayer.playAudio('bangMedium.wav', 0.5); // 50% volume
                score = 50;

                this.createExplosion(asteroid);

                break;
            case 'small':
                score = 10;
                AsteroidManager.audioPlayer.playAudio('bangSmall.wav', 0.5); // 50% volume

                this.createExplosion(asteroid);

                break;
            default:
                console.error('Invalid asteroid size:', asteroid.size);
                return 0;
        }

        if (!SystemUtils.destroy(asteroid)) {
            console.error('Failed to destroy asteroid:', asteroidKey);
        }
        this.asteroids.delete(asteroidKey);

        return score;
    }

    destroy() {
        try {
            SystemUtils.cleanupMap(this.asteroids);
            this.asteroids = null;
            this.asteroidID = null;
            this.level = null;
            return true;
        } catch (error) {
            console.error('Error during AsteroidManager destruction:', error);
            return false;
        }
    }
}

export default AsteroidManager;
// ToolboxAid.com
// David Quesenberry
// 11/19/2024
// asteroidManager.js

import { canvasConfig } from './global.js';
import Asteroid from './asteroid.js';
import AngleUtils from '../engine/math/angleUtils.js';
import CollisionUtils from '../engine/physics/collisionUtils.js';
import GeometryUtils from '../engine/math/geometryUtils.js';
import RandomUtils from '../engine/math/randomUtils.js';
import SystemUtils from '../engine/utils/systemUtils.js';
import CanExplode from '../engine/utils/canExplode.js';

class AsteroidManager extends CanExplode {
    static DEBUG = new URLSearchParams(window.location.search).has('asteroidManager');
    static audioPlayer = null;

    constructor(audioPlayer) {
        super();

        this.asteroids = new Map();
        this.asteroidID = 0;
        this.level = 1;

        AsteroidManager.audioPlayer = audioPlayer;

        this.initAsteroids();
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

            this.createAsteroid(position.x, position.y, 'large');
        }
    }

    createAsteroid(x, y, size) {
        const key = `${size}-${this.asteroidID++}`;
        const asteroid = new Asteroid(x, y, size);

        this.asteroids.set(key, asteroid);

        return asteroid;
    }

    update(deltaTime) {
        for (const [asteroidKey, asteroid] of this.asteroids.entries()) {
            if (!asteroid || asteroid.isDestroyed) {
                continue;
            }

            try {
                asteroid.update(deltaTime);
            } catch (error) {
                console.error('Asteroid update error:', asteroidKey, error, asteroid);
            }
        }

        if (this.asteroids.size === 0) {
            this.level++;
            this.initAsteroids();
        }

        this.updateParticleExplosion(deltaTime);
    }

    draw() {
        for (const [asteroidKey, asteroid] of this.asteroids.entries()) {
            if (!asteroid || typeof asteroid.draw !== 'function') {
                continue;
            }

            try {
                asteroid.draw();
            } catch (error) {
                console.error('Asteroid draw error:', asteroidKey, error, asteroid);
            }
        }
    }

    safeSpawn(ship) {
        const SAFE_DISTANCE = 200;
        let isSafe = true;

        for (const asteroid of this.asteroids.values()) {
            if (!asteroid || asteroid.isDestroyed) {
                continue;
            }

            if (GeometryUtils.getDistanceObjects(ship, asteroid) < SAFE_DISTANCE) {
                isSafe = false;

                if (AsteroidManager.DEBUG) {
                    console.log(
                        '#########################isSafe:',
                        GeometryUtils.getDistanceObjects(ship, asteroid),
                        isSafe,
                        ship,
                        asteroid
                    );
                }

                break;
            }
        }

        return isSafe;
    }

    checkShip(object) {
        if (!object || typeof object.isAlive !== 'function' || !object.isAlive()) {
            return;
        }

        for (const [asteroidKey, asteroid] of this.asteroids.entries()) {
            if (!asteroid || asteroid.isDestroyed) {
                continue;
            }

            if (CollisionUtils.vectorCollisionDetection(object, asteroid)) {
                if (AsteroidManager.DEBUG) {
                    console.log('Ship hit:', { object, asteroid, asteroidKey });
                }

                if (typeof object.setIsDying === 'function') {
                    object.setIsDying();
                }

                this.createExplosion(object);
                this.setAsteroidHit(asteroid, asteroidKey);
                return;
            }
        }
    }

    checkBullet(bullet) {
        if (!bullet || bullet.isDead()) {
            return 0;
        }

        let score = 0;

        for (const [asteroidKey, asteroid] of this.asteroids.entries()) {
            if (!asteroid || asteroid.isDestroyed) {
                continue;
            }

            if (bullet.collisionDetection(asteroid)) {
                bullet.setIsDead();

                if (AsteroidManager.DEBUG) {
                    console.log(`Bullet hit asteroid:
                        Bullet: ${JSON.stringify(bullet)}
                        Asteroid: ${JSON.stringify(asteroid)}
                    `);
                }

                score = this.setAsteroidHit(asteroid, asteroidKey);
                break;
            }
        }

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

                if (AsteroidManager.audioPlayer) {
                    AsteroidManager.audioPlayer.playAudio('bangLarge.wav', 0.5);
                }

                this.createExplosion(asteroid);
                break;

            case 'medium':
                this.createAsteroid(asteroid.x, asteroid.y, 'small');
                this.createAsteroid(asteroid.x, asteroid.y, 'small');
                score = 50;

                if (AsteroidManager.audioPlayer) {
                    AsteroidManager.audioPlayer.playAudio('bangMedium.wav', 0.5);
                }

                this.createExplosion(asteroid);
                break;

            case 'small':
                score = 10;

                if (AsteroidManager.audioPlayer) {
                    AsteroidManager.audioPlayer.playAudio('bangSmall.wav', 0.5);
                }

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
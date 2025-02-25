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

class AsteroidManager {
    // Enable debug mode: game.html?asteroidManager
    static DEBUG = new URLSearchParams(window.location.search).has('asteroidManager');

    constructor() {
        this.asteroids = new Map();
        this.asteroidID = 0;
        this.level = 1;
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

            this.createAsteroid(position.x, position.y, "large");
        }
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
        this.asteroids.forEach(asteroid => {
            if (CollisionUtils.vectorCollisionDetection(ship, asteroid)) {
                if (AsteroidManager.DEBUG) {
                    console.log("Ship hit:", { ship, asteroid });
                }
                ship.setIsDying();
            }
        });
    }

    checkUFO(ufo) {
        if (this.ufo && this.ufo.isAlive()) {
            if (AsteroidManager.DEBUG) {
                console.log("UFO update", "ufoTimer.getProgress", this.ufo, this.ufoTimer.getProgress(), this.ufoTimer);
            }

            this.asteroids.forEach((asteroid, asteroidKey) => {
                if (CollisionUtils.vectorCollisionDetection(ufo, asteroid)) {
                    this.setAsteroidHit(asteroid, asteroidKey);
                    ufo.setIsDying();

                    if (AsteroidManager.DEBUG) {
                        console.log("UFO hit asteroid");
                    }
                }
            });
        }
    }

    checkBullet(bullet) {
        let score = 0;
        this.asteroids.forEach((asteroid, asteroidKey) => {
            if (bullet.collisionDetection(asteroid)) {
                bullet.setIsDead();
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
                Ship.audioPlayer.playAudio('bangLarge.wav', 0.5); // 50% volume
                break;
            case 'medium':
                this.createAsteroid(asteroid.x, asteroid.y, 'small');
                this.createAsteroid(asteroid.x, asteroid.y, 'small');
                Ship.audioPlayer.playAudio('bangMedium.wav', 0.5); // 50% volume
                score = 50;
                break;
            case 'small':
                score = 10;
                Ship.audioPlayer.playAudio('bangSmall.wav', 0.5); // 50% volume
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
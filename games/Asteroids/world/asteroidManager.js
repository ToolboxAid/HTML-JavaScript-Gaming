// ToolboxAid.com
// David Quesenberry
// 11/19/2024
// asteroidManager.js

import DebugFlag from '../../../engine/utils/debugFlag.js';
import DebugFlag from '';
import { canvasConfig } from '../global.js';
import Asteroid from '../asteroid.js';
import AngleUtils from '../../../engine/math/angleUtils.js';
import CollisionUtils from '../../../engine/physics/collisionUtils.js';
import GeometryUtils from '../../../engine/math/geometryUtils.js';
import RandomUtils from '../../../engine/math/randomUtils.js';
import SystemUtils from '../../../engine/utils/systemUtils.js';
import CanExplode from '../../../engine/utils/canExplode.js';
import DifficultyProfile from '../systems/difficultyProfile.js';

class AsteroidManager extends CanExplode {
    static DEBUG = DebugFlag.has('');
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
        const maxAsteroids = DifficultyProfile.getWaveAsteroidCount(this.level);
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
        const speedMultiplier = DifficultyProfile.getAsteroidSpeedMultiplier(this.level, size);
        const asteroid = new Asteroid(x, y, size, speedMultiplier);

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

    findCollisionWithObject(object) {
        if (!object || typeof object.isAlive !== 'function' || !object.isAlive()) {
            return null;
        }

        for (const [asteroidKey, asteroid] of this.asteroids.entries()) {
            if (!asteroid || asteroid.isDestroyed) {
                continue;
            }

            if (CollisionUtils.vectorCollisionDetection(object, asteroid)) {
                if (AsteroidManager.DEBUG) {
                    console.log('Ship hit:', { object, asteroid, asteroidKey });
                }

                return { asteroidKey, asteroid };
            }
        }

        return null;
    }

    findCollisionWithBullet(bullet) {
        if (!bullet || bullet.isDead()) {
            return null;
        }

        for (const [asteroidKey, asteroid] of this.asteroids.entries()) {
            if (!asteroid || asteroid.isDestroyed) {
                continue;
            }

            if (bullet.collisionDetection(asteroid)) {
                if (AsteroidManager.DEBUG) {
                    console.log(`Bullet hit asteroid:
                        Bullet: ${JSON.stringify(bullet)}
                        Asteroid: ${JSON.stringify(asteroid)}
                    `);
                }

                return { asteroidKey, asteroid };
            }
        }

        return null;
    }

    spawnChildAsteroids(asteroid, size, count = 2) {
        for (let i = 0; i < count; i++) {
            this.createAsteroid(asteroid.x, asteroid.y, size);
        }
    }

    playHitAudio(size) {
        if (!AsteroidManager.audioPlayer) {
            return;
        }

        switch (size) {
            case 'large':
                AsteroidManager.audioPlayer.playAudio('bangLarge.wav', 0.5);
                break;
            case 'medium':
                AsteroidManager.audioPlayer.playAudio('bangMedium.wav', 0.5);
                break;
            case 'small':
                AsteroidManager.audioPlayer.playAudio('bangSmall.wav', 0.5);
                break;
            default:
                break;
        }
    }

    removeAsteroid(asteroidKey) {
        if (!asteroidKey || !this.asteroids.has(asteroidKey)) {
            console.error('Invalid asteroid or key:', asteroidKey);
            return false;
        }

        const asteroid = this.asteroids.get(asteroidKey);
        if (!SystemUtils.destroy(asteroid)) {
            console.error('Failed to destroy asteroid:', asteroidKey);
            return false;
        }

        this.asteroids.delete(asteroidKey);
        return true;
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


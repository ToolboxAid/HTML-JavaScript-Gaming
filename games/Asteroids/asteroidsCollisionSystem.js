// ToolboxAid.com
// David Quesenberry
// 03/12/2026
// asteroidsCollisionSystem.js

import AsteroidsHitResolver from './asteroidsHitResolver.js';

class AsteroidsCollisionSystem {
    static resolve(world, ship) {
        const ufo = world.ufoManager.getUfo();
        let score = 0;

        const shipAsteroidCollision = world.asteroidManager.findCollisionWithObject(ship);
        if (shipAsteroidCollision) {
            score += AsteroidsHitResolver.hitShipByAsteroid(world, ship, shipAsteroidCollision);
        }

        if (ufo && typeof ufo.isAlive === 'function') {
            const ufoAsteroidCollision = world.asteroidManager.findCollisionWithObject(ufo);
            if (ufoAsteroidCollision) {
                score += AsteroidsHitResolver.hitUfoByAsteroid(world, ufo, ufoAsteroidCollision);
            }
        }

        world.bulletManager.bullets.forEach((bullet) => {
            const collision = world.asteroidManager.findCollisionWithBullet(bullet);
            if (collision) {
                score += AsteroidsHitResolver.hitAsteroidByBullet(world, bullet, collision);
            }
        });

        const ufoBullets = world.ufoManager.getActiveBullets();

        ufoBullets.forEach((bullet) => {
            const collision = world.asteroidManager.findCollisionWithBullet(bullet);
            if (collision) {
                AsteroidsHitResolver.hitAsteroidByBullet(world, bullet, collision);
            }
        });

        world.bulletManager.bullets.forEach((bullet) => {
            if (ufo && bullet.collisionDetection(ufo)) {
                score += AsteroidsHitResolver.hitUfo(world, bullet, ufo);
            }
        });

        if (ship.isAlive()) {
            ufoBullets.forEach((bullet) => {
                if (bullet.team !== 'player' && bullet.collisionDetection(ship)) {
                    AsteroidsHitResolver.hitShipByUfoBullet(world, bullet, ship);
                }
            });
        }

        if (ship.isAlive()) {
            world.bulletManager.bullets.forEach((bullet) => {
                if (bullet.ownerId !== ship.ID && bullet.collisionDetection(ship)) {
                    AsteroidsHitResolver.hitShipByPlayerBullet(world, bullet, ship);
                }
            });
        }

        world.ufoManager.check(ship);

        return score;
    }
}

export default AsteroidsCollisionSystem;

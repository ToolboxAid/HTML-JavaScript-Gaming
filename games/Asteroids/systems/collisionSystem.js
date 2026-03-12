// ToolboxAid.com
// David Quesenberry
// 03/12/2026
// collisionSystem.js

import AsteroidsHitResolver from './hitResolver.js';

class AsteroidsCollisionSystem {
    static resolve(world, ship) {
        const ufo = world.ufoManager.getUfo();

        const shipAsteroidCollision = world.asteroidManager.findCollisionWithObject(ship);
        if (shipAsteroidCollision) {
            AsteroidsHitResolver.hitShipByAsteroid(world, ship, shipAsteroidCollision);
        }

        if (ufo && typeof ufo.isAlive === 'function') {
            const ufoAsteroidCollision = world.asteroidManager.findCollisionWithObject(ufo);
            if (ufoAsteroidCollision) {
                AsteroidsHitResolver.hitUfoByAsteroid(world, ufo, ufoAsteroidCollision);
            }
        }

        world.bulletManager.bullets.forEach((bullet) => {
            const collision = world.asteroidManager.findCollisionWithBullet(bullet);
            if (collision) {
                AsteroidsHitResolver.hitAsteroidByBullet(world, bullet, collision);
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
                AsteroidsHitResolver.hitUfo(world, bullet, ufo);
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
    }
}

export default AsteroidsCollisionSystem;

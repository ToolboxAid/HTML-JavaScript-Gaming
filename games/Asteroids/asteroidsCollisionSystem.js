// ToolboxAid.com
// David Quesenberry
// 03/12/2026
// asteroidsCollisionSystem.js

import AsteroidsHitResolver from './asteroidsHitResolver.js';

class AsteroidsCollisionSystem {
    static resolve(world, ship) {
        const ufo = world.ufoManager.getUfo();
        let score = 0;

        world.asteroidManager.checkShip(ship);

        if (ufo && typeof ufo.isAlive === 'function') {
            world.asteroidManager.checkShip(ufo);
        }

        world.bulletManager.bullets.forEach((bullet) => {
            score += world.asteroidManager.checkBullet(bullet);
        });

        const ufoBullets = world.ufoManager.getActiveBullets();

        ufoBullets.forEach((bullet) => {
            world.asteroidManager.checkBullet(bullet);
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
